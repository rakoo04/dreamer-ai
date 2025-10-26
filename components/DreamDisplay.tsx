import React from 'react';
import { DreamData } from '../types';
import { BrainCircuitIcon } from './Icons';

interface DreamDisplayProps {
  dreamData: DreamData;
}

const ImagePlaceholder = () => (
    <div className="relative w-full aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-300">
        <BrainCircuitIcon className="w-16 h-16 opacity-30 animate-pulse" />
        <p className="mt-4 font-semibold">Conjuring image...</p>
      </div>
    </div>
  );

const DreamDisplay: React.FC<DreamDisplayProps> = ({ dreamData }) => {

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
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      <div className="bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
        {dreamData.imageUrl ? (
            <img
            src={dreamData.imageUrl}
            alt="Surrealist representation of the dream"
            className="w-full h-auto object-cover transition-opacity duration-700 opacity-0"
            onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
            />
        ) : (
            <ImagePlaceholder />
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-purple-300 mb-4 border-b-2 border-purple-500 pb-2">Dream Transcription</h3>
        <p className="text-gray-300 italic">"{dreamData.transcription}"</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
         {parseMarkdown(dreamData.interpretation)}
      </div>
    </div>
  );
};

export default DreamDisplay;