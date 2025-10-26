import React, { useState, useCallback, useEffect } from 'react';
import { AppState, DreamData } from './types';
import DreamInput from './components/VoiceRecorder';
import Loader from './components/Loader';
import DreamDisplay from './components/DreamDisplay';
import ChatComponent from './components/Chat';
import { generateDreamImage, interpretDream } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Idle);
  const [dreamData, setDreamData] = useState<DreamData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDreamSubmit = useCallback(async (dreamText: string) => {
    if (!dreamText) {
        setErrorMessage("Dream description was empty. Please try again.");
        setAppState(AppState.Error);
        return;
    }

    try {
      setAppState(AppState.Processing);
      
      // First, generate the interpretation
      const interpretation = await interpretDream(dreamText);

      // Show the interpretation while the image generates in the background
      setDreamData({
        transcription: dreamText,
        imageUrl: '', // Set image URL to empty to trigger placeholder
        interpretation,
      });
      setAppState(AppState.Done);
    } catch (error) {
      console.error("Error processing dream interpretation:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred during interpretation.";
      setErrorMessage(`Failed to interpret your dream. ${message}`);
      setAppState(AppState.Error);
    }
  }, []);

  // Effect to generate the image after the interpretation is done
  useEffect(() => {
    const generateAndSetImage = async () => {
        if (appState === AppState.Done && dreamData && !dreamData.imageUrl) {
            try {
                const imageUrl = await generateDreamImage(dreamData.transcription);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, dreamData]);


  const resetApp = () => {
    setAppState(AppState.Idle);
    setDreamData(null);
    setErrorMessage('');
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.Idle:
        return (
          <DreamInput
            onDreamSubmit={handleDreamSubmit}
          />
        );
      case AppState.Processing:
        return <Loader message="Weaving your dream's meaning..." />;
      case AppState.Done:
        return dreamData ? (
          <>
            <DreamDisplay dreamData={dreamData} />
            <ChatComponent dreamData={dreamData} />
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

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="text-center p-6 border-b border-gray-700 shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
            Lucid Weaver
            </span>
        </h1>
        <p className="text-gray-400 mt-2">Your AI-Powered Dream Journal</p>
      </header>
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;