import React, { useState } from 'react';
import { BrainCircuitIcon } from './Icons';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onApiKeySubmit(key.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-center text-purple-300">
        Enter Your Gemini API Key
      </h2>
      <p className="text-center text-gray-400">
        To use Lucid Weaver, please provide your Google AI Studio API key. Your key is stored only in your browser's local storage.
      </p>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your API key here"
          className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          aria-label="Gemini API Key Input"
        />
        <button
          type="submit"
          disabled={!key.trim()}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-purple-500"
        >
          <BrainCircuitIcon className="w-6 h-6" />
          <span>Start Weaving</span>
        </button>
      </form>
      <p className="text-sm text-gray-500 text-center">
        You can get your API key from{' '}
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-purple-400 hover:underline"
        >
          Google AI Studio
        </a>.
      </p>
    </div>
  );
};

export default ApiKeyInput;
