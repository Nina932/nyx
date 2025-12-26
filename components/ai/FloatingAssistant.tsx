import React, { useState } from 'react';
import { getChatResponse, Persona } from '../../services/geminiService';
import { useTranslation } from '../../hooks/useTranslation';
import { NyxLogo } from '../icons/NyxLogo';
import { BrainIcon } from '../icons/BrainIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';

const PersonaButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-md transition-colors text-xs ${
            isActive ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400'
        }`}
    >
        {icon}
        <span className="mt-1">{label}</span>
    </button>
);


export const FloatingAssistant: React.FC = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [persona, setPersona] = useState<Persona>('general');

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage = { role: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await getChatResponse(userMessage.text, persona);
            const modelMessage = { role: 'model' as const, text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { role: 'model' as const, text: 'Sorry, an error occurred.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-28 h-28 flex items-center justify-center text-white transform hover:scale-125 transition-transform duration-300 ease-in-out animate-pulse-glow"
                aria-label={t('floatingAssistantTitle')}
            >
                <NyxLogo className="w-28 h-28" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="w-full max-w-2xl h-[80vh] bg-slate-900/80 border border-cyan-400/30 rounded-lg shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-cyan-400/20">
                    <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                        <NyxLogo className="w-8 h-8" /> {t('floatingAssistantTitle')}
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                <div className="p-3 border-b border-cyan-400/20">
                    <div className="flex items-center justify-around gap-2">
                         <PersonaButton label={t('persona_general')} icon={<BrainIcon className="w-5 h-5"/>} isActive={persona==='general'} onClick={() => setPersona('general')} />
                         <PersonaButton label={t('persona_strategist')} icon={<BriefcaseIcon className="w-5 h-5"/>} isActive={persona==='strategist'} onClick={() => setPersona('strategist')} />
                         <PersonaButton label={t('persona_data_analyst')} icon={<ChartBarIcon className="w-5 h-5"/>} isActive={persona==='data_analyst'} onClick={() => setPersona('data_analyst')} />
                    </div>
                </div>

                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                             <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600/40' : 'bg-slate-800'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="max-w-md p-3 rounded-lg bg-slate-800">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-200"></div>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-400"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-cyan-400/20">
                     <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                        <div className="flex items-center bg-slate-800 rounded-lg">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t('startTyping')}
                                className="w-full bg-transparent p-3 focus:outline-none text-sm"
                                disabled={isLoading}
                            />
                            <button type="submit" className="p-3 text-cyan-400 hover:text-white disabled:text-slate-500" disabled={isLoading || !input.trim()}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};