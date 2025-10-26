import React, { useState, useRef, useCallback } from 'react';
import { DreamData } from '../types';
import { BrainCircuitIcon, SpeakerLoudIcon, StopCircleIcon, DownloadIcon } from './Icons';
import { generateInterpretationAudio } from '../services/geminiService';

interface DreamDisplayProps {
  dreamData: DreamData;
}

// Audio decoding helpers
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
  
async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
}


const ImagePlaceholder = () => (
    <div className="relative w-full aspect-video bg-gray-700 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-300">
        <BrainCircuitIcon className="w-16 h-16 opacity-30 animate-pulse" />
        <p className="mt-4 font-semibold">Conjuring image...</p>
      </div>
    </div>
  );

const DreamDisplay: React.FC<DreamDisplayProps> = ({ dreamData }) => {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const audioDataRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const playAudio = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioCtx = audioContextRef.current;
    
    const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    
    source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
    };
    
    source.start();
    audioSourceRef.current = source;
    setIsPlaying(true);
  }, []);

  const handleToggleAudio = useCallback(async () => {
    if (isPlaying) {
        audioSourceRef.current?.stop();
        return;
    }
    if (audioDataRef.current) {
        await playAudio(audioDataRef.current);
        return;
    }
    
    setIsGeneratingAudio(true);
    try {
        const interpretationText = dreamData.interpretation.replace(/#.*$/m, '').trim();
        const base64Audio = await generateInterpretationAudio(interpretationText);
        audioDataRef.current = base64Audio;
        await playAudio(base64Audio);
    } catch (error) {
        console.error("Failed to play audio:", error);
    } finally {
        setIsGeneratingAudio(false);
    }
  }, [isPlaying, dreamData.interpretation, playAudio]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = dreamData.imageUrl;
        });

        const canvasWidth = 1920;
        const padding = 80;
        const contentWidth = canvasWidth - (padding * 2);
        const imageHeight = canvasWidth * (img.height / img.width);
        
        const textLines = dreamData.interpretation.split('\n').filter(line => line.trim().length > 0 && !line.startsWith('# Dream Interpretation'));
        let estimatedTextHeight = 0;

        const measureTextHeight = (text: string, font: string, maxWidth: number) => {
            ctx.font = font;
            const words = text.split(' ');
            let line = '';
            let height = 0;
            const metrics = ctx.measureText('M');
            const singleLineHeight = (metrics.fontBoundingBoxAscent || parseInt(font)) + (metrics.fontBoundingBoxDescent || 0);
            const lineHeightMultiplier = 1.5;

            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxWidth && n > 0) {
                    height += singleLineHeight * lineHeightMultiplier;
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            height += singleLineHeight * lineHeightMultiplier;
            return height;
        };
        
        textLines.forEach(line => {
            if (line.startsWith('# ')) estimatedTextHeight += measureTextHeight(line.substring(2), 'bold 60px sans-serif', contentWidth) + 40;
            else if (line.startsWith('## ')) estimatedTextHeight += measureTextHeight(line.substring(3), 'bold 48px sans-serif', contentWidth) + 30;
            else if (line.startsWith('- ')) estimatedTextHeight += measureTextHeight(line.substring(2), '40px sans-serif', contentWidth - 40) + 15;
            else estimatedTextHeight += measureTextHeight(line, '40px sans-serif', contentWidth) + 20;
        });

        canvas.width = canvasWidth;
        canvas.height = imageHeight + estimatedTextHeight + (padding * 2);

        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvasWidth, imageHeight);

        let currentY = imageHeight + padding;

        const wrapText = (text: string, x: number, y: number, maxWidth: number, font: string, color: string, listStyle = false) => {
            ctx.font = font;
            ctx.fillStyle = color;
            const words = text.split(' ');
            let line = '';
            const metrics = ctx.measureText('M');
            const singleLineHeight = (metrics.fontBoundingBoxAscent || parseInt(font)) + (metrics.fontBoundingBoxDescent || 0);
            const effectiveLineHeight = singleLineHeight * 1.5;

            if (listStyle) {
                ctx.fillText('•', x, y);
                x += 40;
                maxWidth -= 40;
            }

            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += effectiveLineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, y);
            return y + effectiveLineHeight;
        };

        textLines.forEach(line => {
            if (line.startsWith('# ')) currentY = wrapText(line.substring(2), padding, currentY, contentWidth, 'bold 60px sans-serif', '#c4b5fd') + 40;
            else if (line.startsWith('## ')) currentY = wrapText(line.substring(3), padding, currentY, contentWidth, 'bold 48px sans-serif', '#a78bfa') + 30;
            else if (line.startsWith('- ')) currentY = wrapText(line.substring(2), padding, currentY, contentWidth, '40px sans-serif', '#d1d5db', true) + 15;
            else currentY = wrapText(line, padding, currentY, contentWidth, '40px sans-serif', '#d1d5db') + 20;
        });

        const link = document.createElement('a');
        link.download = 'lucid-weaver-dream.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

    } catch (error) {
        console.error("Failed to download image:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    
    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc ml-6 space-y-2 mb-4">
                    {listItems.map((item, i) => <li key={i} className="text-gray-300">{item}</li>)}
                </ul>
            );
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.startsWith('# Dream Interpretation')) return;
        if (line.startsWith('# ')) {
            flushList();
            elements.push(<h2 key={index} className="text-2xl font-bold text-purple-300 mt-6 mb-2">{line.substring(2)}</h2>);
        } else if (line.startsWith('## ')) {
            flushList();
            elements.push(<h3 key={index} className="text-xl font-semibold text-purple-400 mt-4 mb-2">{line.substring(3)}</h3>);
        } else if (line.startsWith('- ')) {
            listItems.push(line.substring(2));
        } else {
            flushList();
            if (line.trim().length > 0) {
                elements.push(<p key={index} className="text-gray-300 leading-relaxed mb-4">{line}</p>);
            }
        }
    });
    
    flushList();
    return elements;
  };

  return (
    <div className="w-full space-y-8">
      <div className="bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
        {dreamData.imageUrl ? (
            <img
            src={dreamData.imageUrl}
            alt="Surrealist representation of the dream"
            className="w-full aspect-video object-cover transition-opacity duration-700 opacity-0"
            onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
            />
        ) : (
            <ImagePlaceholder />
        )}
      </div>

      <div className="space-y-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-purple-300 mb-4 border-b-2 border-purple-500 pb-2">Dream Transcription</h3>
            <p className="text-gray-300 italic">"{dreamData.transcription}"</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b-2 border-purple-500 pb-2">
                <h3 className="text-2xl font-bold text-purple-300">Dream Interpretation</h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleToggleAudio} 
                        disabled={isGeneratingAudio}
                        className="p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        aria-label={isPlaying ? "Stop narration" : "Listen to narration"}
                    >
                        {isGeneratingAudio ? (
                            <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white"></div>
                        ) : isPlaying ? (
                            <StopCircleIcon className="w-6 h-6 text-purple-300" />
                        ) : (
                            <SpeakerLoudIcon className="w-6 h-6 text-purple-300" />
                        )}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        aria-label="Download interpretation as image"
                    >
                        {isDownloading ? (
                            <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white"></div>
                        ) : (
                            <DownloadIcon className="w-6 h-6 text-purple-300" />
                        )}
                    </button>
                </div>
            </div>
            {parseMarkdown(dreamData.interpretation)}
        </div>
      </div>
    </div>
  );
};

export default DreamDisplay;