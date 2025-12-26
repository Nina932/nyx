import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Policy } from '../types';
import { answerPolicyQuestion } from '../services/geminiService';
import { getPolicies, addPolicy } from '../services/policies';

const PolicyForm: React.FC<{
    onClose: () => void;
    onSave: (data: { title: { en: string; ka: string; }, content: { en: string; ka: string; } }) => Promise<void>;
}> = ({ onClose, onSave }) => {
    const { t } = useTranslation();
    const [titleEn, setTitleEn] = useState('');
    const [titleKa, setTitleKa] = useState('');
    const [contentEn, setContentEn] = useState('');
    const [contentKa, setContentKa] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({
            title: { en: titleEn, ka: titleKa },
            content: { en: contentEn, ka: contentKa }
        });
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-cyan-400/50 rounded-lg shadow-2xl p-6 w-full max-w-2xl">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">{t('addPolicy')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder={t('policyTitleEn')} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-sm" required />
                        <input type="text" value={titleKa} onChange={e => setTitleKa(e.target.value)} placeholder={t('policyTitleKa')} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-sm" required />
                    </div>
                    <textarea value={contentEn} onChange={e => setContentEn(e.target.value)} placeholder={t('policyContentEn')} className="w-full h-24 bg-slate-800 border border-slate-600 rounded-md p-2 text-sm resize-y" required />
                    <textarea value={contentKa} onChange={e => setContentKa(e.target.value)} placeholder={t('policyContentKa')} className="w-full h-24 bg-slate-800 border border-slate-600 rounded-md p-2 text-sm resize-y" required />
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-700 text-sm">{t('cancel')}</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm disabled:opacity-50">{isSaving ? t('analyzing') : t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PoliciesModule: React.FC = () => {
    const { t, language } = useTranslation();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const selectedPolicy = policies.find(p => p.id === selectedPolicyId);

    const fetchPolicies = async () => {
        setIsFetching(true);
        try {
            const data = await getPolicies();
            setPolicies(data);
        } catch (error) {
            console.error("Failed to fetch policies:", error);
        } finally {
            setIsFetching(false);
        }
    };
    
    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleAsk = async () => {
        if (!question.trim() || !selectedPolicy) return;
        setIsLoading(true);
        setAnswer('');
        try {
            const result = await answerPolicyQuestion(selectedPolicy, question);
            setAnswer(result);
        } catch (error) {
            setAnswer('Failed to get an answer.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSavePolicy = async (data: { title: { en: string; ka: string; }, content: { en: string; ka: string; } }) => {
        try {
            await addPolicy(data);
            fetchPolicies(); // Refresh the list
        } catch (error) {
            console.error("Failed to save policy:", error);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                {/* Title is now handled by parent DocumentPage */}
                <div></div>
                <button onClick={() => setIsFormOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">{t('addPolicy')}</button>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg">
                <div className="mb-4">
                    <select
                        onChange={(e) => {
                            const id = parseInt(e.target.value);
                            setSelectedPolicyId(isNaN(id) ? null : id);
                            setAnswer('');
                            setQuestion('');
                        }}
                        defaultValue=""
                        className="w-full bg-slate-800/70 border border-slate-600 rounded-md p-2 text-sm"
                        disabled={isFetching}
                    >
                        <option value="" disabled>{isFetching ? t('analyzing') : t('selectPolicy')}</option>
                        {policies.map(p => <option key={p.id} value={p.id}>{p.title[language]}</option>)}
                    </select>
                </div>
                
                {selectedPolicy && (
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-800/50 rounded-md max-h-48 overflow-y-auto">
                            <h3 className="font-bold text-cyan-400">{selectedPolicy.title[language]}</h3>
                            <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">{selectedPolicy.content[language]}</p>
                        </div>
                        
                        <div className="p-4 bg-slate-800/50 rounded-lg border-t-2 border-purple-400/50">
                             <h3 className="font-bold text-purple-300 text-md mb-3">{t('hrComplianceAgent')}</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder={t('askAiAboutPolicy')}
                                    className="w-full bg-slate-700/70 border border-slate-600 rounded-md p-2 text-sm"
                                    disabled={isLoading}
                                />
                                <button onClick={handleAsk} disabled={isLoading || !question.trim()} className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm disabled:bg-slate-700">
                                    {isLoading ? t('analyzing')+'...' : t('ask')}
                                </button>
                            </div>
                            
                            {(isLoading || answer) && (
                                <div className="mt-4 p-4 bg-slate-900/50 rounded-md">
                                    {isLoading && <p>{t('analyzing')}...</p>}
                                    {answer && <p className="text-sm text-slate-200 whitespace-pre-wrap">{answer}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
             {isFormOpen && <PolicyForm onClose={() => setIsFormOpen(false)} onSave={handleSavePolicy} />}
        </div>
    );
};

export default PoliciesModule;