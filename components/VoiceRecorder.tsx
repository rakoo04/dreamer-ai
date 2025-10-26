import React, { useState } from 'react';
import { BrainCircuitIcon } from './Icons';

interface DreamInputProps {
  onDreamSubmit: (dreamText: string) => void;
}

const DreamInput: React.FC<DreamInputProps> = ({ onDreamSubmit }) => {
  const [dreamText, setDreamText] = useState('');

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
        Write down the details of your dream. The more vivid the description, the deeper the insight. Capture the feelings, symbols, and narrative.
      </p>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <textarea
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          placeholder="I was flying over a city made of glass..."
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