import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuitIcon, MicrophoneIcon, StopIcon } from './Icons';

// Fix: Add type definitions for the Web Speech API to resolve TypeScript errors.
// This is necessary because the Web Speech API is not yet a W3C standard and not included in default TypeScript DOM types.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onstart: () => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

interface DreamInputProps {
  onDreamSubmit: (dreamText: string) => void;
}

const DreamInput: React.FC<DreamInputProps> = ({ onDreamSubmit }) => {
  const [dreamText, setDreamText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textBeforeRecording = useRef<string>('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.onerror = (event) => {
        console.error("Speech Recognition Error", event.error);
        setIsRecording(false);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');
      
      const baseText = textBeforeRecording.current;
      const separator = baseText.length > 0 && !baseText.endsWith(' ') ? ' ' : '';
      
      setDreamText(baseText + separator + transcript);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      textBeforeRecording.current = dreamText;
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamText.trim()) return;
    onDreamSubmit(dreamText.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-purple-300">
        Describe Your Dream
      </h2>
      <p className="text-center text-gray-400">
        Write or record the details of your dream. The more vivid the description, the deeper the insight.
      </p>
      
      {isSpeechSupported ? (
          <div className="w-full flex justify-center my-4">
              <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center justify-center gap-3 w-48 h-16 rounded-full text-white font-bold text-lg transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                      isRecording
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                  {isRecording ? (
                      <>
                          <StopIcon className="w-8 h-8"/>
                          <span>Recording...</span>
                      </>
                  ) : (
                      <>
                          <MicrophoneIcon className="w-8 h-8"/>
                          <span>Record</span>
                      </>
                  )}
              </button>
          </div>
      ) : (
        <p className="text-center text-yellow-400">Speech recognition is not supported in your browser.</p>
      )}

      {isRecording && (
        <div className="text-center text-gray-400 flex items-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="ml-2">Your microphone is active</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <textarea
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          placeholder="I was flying over a city made of glass... or start recording."
          className="w-full h-48 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          aria-label="Dream description input"
        />
        <button
          type="submit"
          disabled={!dreamText.trim()}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-purple-500"
        >
          <BrainCircuitIcon className="w-6 h-6" />
          <span>Weave My Dream</span>
        </button>
      </form>
    </div>
  );
};

export default DreamInput;
