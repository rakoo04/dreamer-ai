import React, { useState, useCallback, useEffect } from 'react';
import { AppState, DreamData } from './types';
import DreamInput from './components/VoiceRecorder';
import Loader from './components/Loader';
import DreamDisplay from './components/DreamDisplay';
import ChatComponent from './components/Chat';
import { generateDreamImage, interpretDream } from './services/geminiService';
import { BrainCircuitIcon } from './components/Icons';
import ApiKeyInput from './components/ApiKeyInput';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.Idle);
  const [dreamData, setDreamData] = useState<DreamData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini-api-key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini-api-key', key);
  };

  const handleDreamSubmit = useCallback(async (dreamText: string) => {
    if (!apiKey) {
        setErrorMessage("API Key is not set.");
        setAppState(AppState.Error);
        return;
    }
    if (!dreamText) {
        setErrorMessage("Dream description was empty. Please try again.");
        setAppState(AppState.Error);
        return;
    }

    try {
      setAppState(AppState.Processing);
      
      const interpretation = await interpretDream(apiKey, dreamText);

      setDreamData({
        transcription: dreamText,
        imageUrl: '',
        interpretation,
      });
      setAppState(AppState.Done);
    } catch (error) {
      console.error("Error processing dream interpretation:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred during interpretation.";
      setErrorMessage(`Failed to interpret your dream. ${message}`);
      setAppState(AppState.Error);
    }
  }, [apiKey]);

  useEffect(() => {
    const generateAndSetImage = async () => {
        if (appState === AppState.Done && dreamData && !dreamData.imageUrl && apiKey) {
            try {
                const imageUrl = await generateDreamImage(apiKey, dreamData.transcription);
                setDreamData(d => d ? { ...d, imageUrl } : null);
            } catch (error) {
                 console.error("Error generating image:", error);
                 const message = error instanceof Error ? error.message : "An unknown error occurred during image generation.";
                 setErrorMessage(`Failed to generate the dream image. ${message}`);
                 setAppState(AppState.Error);
            }
        }
    };
    generateAndSetImage();
  }, [appState, dreamData, apiKey]);

  const resetApp = () => {
    setAppState(AppState.Idle);
    setDreamData(null);
    setErrorMessage('');
  };
  
  const renderLeftColumn = () => {
    switch (appState) {
      case AppState.Idle:
        return (
          <DreamInput
            onDreamSubmit={handleDreamSubmit}
          />
        );
      case AppState.Processing:
        return <div className="flex items-center justify-center h-full"><Loader message="Weaving your dream's meaning..." /></div>;
      case AppState.Done:
        return dreamData && apiKey ? (
          <>
            <DreamDisplay dreamData={dreamData} apiKey={apiKey} />
             <div className="text-center my-8">
                <button onClick={resetApp} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Describe Another Dream
                </button>
            </div>
          </>
        ) : null;
      case AppState.Error:
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                <h2 className="text-2xl font-bold text-red-400">An Error Occurred</h2>
                <p className="text-red-300">{errorMessage}</p>
                <button onClick={resetApp} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Try Again
                </button>
            </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (!apiKey) {
      return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
    }

    return (
      <main className="flex-grow w-full max-w-screen-2xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {renderLeftColumn()}
            </div>
            <aside className="lg:col-span-1 hidden lg:block">
                <div className="sticky top-28 h-[calc(100vh-8.5rem)]">
                    {appState === AppState.Done && dreamData && apiKey ? (
                        <ChatComponent dreamData={dreamData} apiKey={apiKey} />
                    ) : (
                        <div className="bg-gray-800/50 shadow-inner rounded-lg flex flex-col h-full items-center justify-center p-8 border-2 border-dashed border-gray-700">
                             <BrainCircuitIcon className="w-16 h-16 text-gray-600" />
                             <p className="text-gray-500 mt-4 text-center font-semibold text-lg">Dream Assistant</p>
                            <p className="text-gray-600 mt-2 text-center">Your chat assistant will appear here once your dream has been analyzed.</p>
                        </div>
                    )}
                </div>
            </aside>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <header className="text-center p-6 border-b border-gray-700 shadow-md sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
            Lucid Weaver
            </span>
        </h1>
        <p className="text-gray-400 mt-2">Your AI-Powered Dream Journal</p>
      </header>
      {renderContent()}
    </div>
  );
};

export default App;
