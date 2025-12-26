
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, GroundingChunk } from '../types';
import { getChatResponse, getThinkingResponse, getSearchGroundedResponse, getMapsGroundedResponse } from '../services/geminiService';
import { GeminiIcon } from './icons/GeminiIcon';
import { useTranslation } from '../hooks/useTranslation';

const CommandButton: React.FC<{ command: string, description: string, onSelect: (cmd: string) => void }> = ({ command, description, onSelect }) => (
    <button
        onClick={() => onSelect(command)}
        className="text-left p-2 rounded-md bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
    >
        <p className="font-mono text-cyan-400">{command}</p>
        <p className="text-xs text-slate-400">{description}</p>
    </button>
);


export const Chatbot: React.FC = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: t('chatbotWelcome') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (messageText = input) => {
        if (!messageText.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: messageText };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        let responseText = '';
        let groundingData: GroundingChunk[] | undefined = undefined;

        try {
            if (messageText.toLowerCase().startsWith('/think ')) {
                const prompt = messageText.substring(7);
                responseText = await getThinkingResponse(prompt);
            } else if (messageText.toLowerCase().startsWith('/search ')) {
                const prompt = messageText.substring(8);
                const { text, grounding } = await getSearchGroundedResponse(prompt);
                responseText = text;
                groundingData = grounding;
            } else if (messageText.toLowerCase().startsWith('/maps ')) {
                const prompt = messageText.substring(6);
                const { text, grounding } = await getMapsGroundedResponse(prompt);
                responseText = text;
                groundingData = grounding;
            } else {
                responseText = await getChatResponse(messageText);
            }
        } catch (error) {
            responseText = "An unexpected error occurred. Please see the console.";
            console.error(error);
        }

        const newModelMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, grounding: groundingData };
        setMessages(prev => [...prev, newModelMessage]);
        setIsLoading(false);
    };

    const renderGrounding = (grounding: GroundingChunk[]) => (
        <div className="mt-2 border-t border-slate-600 pt-2">
            <h4 className="text-xs font-semibold text-cyan-500 mb-1">{t('sources')}:</h4>
            <ul className="text-xs space-y-1">
                {grounding.map((chunk, index) => {
                    const source = chunk.web || chunk.maps;
                    if (!source) return null;
                    return (
                        <li key={index}>
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors truncate block">
                               - {source.title}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.1)]">
            <div className="p-4 border-b border-cyan-400/30 text-center">
                <h2 className="font-bold text-lg text-cyan-400 tracking-wider">{t('aiFloatingChat')}</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <GeminiIcon className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />}
                        <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600/40 text-white' : 'bg-slate-800/70'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            {msg.grounding && msg.grounding.length > 0 && renderGrounding(msg.grounding)}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <GeminiIcon className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                        <div className="max-w-md p-3 rounded-lg bg-slate-800/70">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-200"></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-400"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {!messages.some(m => m.role === 'user') && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-cyan-400/20">
                    <CommandButton command="/think" description={t('cmdThink')} onSelect={(cmd) => setInput(cmd + ' ')} />
                    <CommandButton command="/search" description={t('cmdSearch')} onSelect={(cmd) => setInput(cmd + ' ')} />
                    <CommandButton command="/maps" description={t('cmdMaps')} onSelect={(cmd) => setInput(cmd + ' ')} />
                    <CommandButton command={t('cmdExample')} description={t('cmdExampleDesc')} onSelect={(cmd) => handleSend(cmd)} />
                </div>
            )}

            <div className="p-4 border-t border-cyan-400/30">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                    <div className="flex items-center bg-slate-800 rounded-lg">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('chatbotPlaceholder')}
                            className="w-full bg-transparent p-3 focus:outline-none text-sm"
                            disabled={isLoading}
                        />
                        <button type="submit" className="p-3 text-cyan-400 hover:text-white disabled:text-slate-500 transition-colors" disabled={isLoading || !input.trim()}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};