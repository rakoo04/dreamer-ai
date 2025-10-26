
import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, DreamData } from '../types';
import { SendIcon, BrainCircuitIcon } from './Icons';

interface ChatProps {
  dreamData: DreamData;
}

const ChatComponent: React.FC<ChatProps> = ({ dreamData }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initializeChat = async () => {
        if (!process.env.API_KEY) {
            console.error("API Key not found");
            return;
        }
        const ai = new (await import('@google/genai')).GoogleGenAI({ apiKey: process.env.API_KEY });
        const initialPrompt = `You are a dream analysis assistant. The user has just had the following dream: "${dreamData.transcription}". The initial interpretation is: "${dreamData.interpretation}". Your role is to answer follow-up questions about specific symbols, feelings, or parts of the dream. Be helpful, insightful, and maintain the persona of a dream expert. Keep your answers concise and focused on the user's question.`;

        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: initialPrompt
            }
        });
        setChat(newChat);

        const initialBotMessage: ChatMessage = {
            role: 'model',
            text: "Do you have any questions about the symbols or feelings in your dream? Feel free to ask."
        };
        setHistory([initialBotMessage]);
    };
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dreamData]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessageStream({ message: input });
      let text = '';
      for await (const chunk of result) {
          text += chunk.text;
      }
      const modelMessage: ChatMessage = { role: 'model', text };
      setHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 mt-8">
        <div className="bg-gray-800 shadow-2xl rounded-lg flex flex-col h-[60vh]">
            <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
                <BrainCircuitIcon className="w-8 h-8 text-purple-400" />
                <h3 className="text-xl font-bold text-purple-300">Explore Your Dream</h3>
            </div>
            <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <BrainCircuitIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />}
                        <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-700 p-3 rounded-2xl rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about a symbol..."
                    className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="ml-3 p-2 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isLoading || !input.trim()}
                >
                    <SendIcon className="w-6 h-6 text-white" />
                </button>
            </form>
        </div>
    </div>
  );
};

export default ChatComponent;
