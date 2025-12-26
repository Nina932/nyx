import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { analyzeDocument } from '../services/geminiService';
import { BrainIcon } from '../components/icons/BrainIcon';
import PoliciesModule from './PoliciesPage';

type AnalysisTask = 'summarize' | 'comply';
type SubPage = 'analysis' | 'policies';

const DocumentAnalysis: React.FC = () => {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [task, setTask] = useState<AnalysisTask>('summarize');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const analysisResult = await analyzeDocument(text, task);
            setResult(analysisResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t('pasteText')}
                    className="w-full h-64 bg-slate-800/70 border border-slate-600 rounded-md p-3 text-sm resize-none"
                />
                <div>
                    <label htmlFor="task-select" className="block text-sm font-medium text-slate-400 mb-1">{t('selectTask')}</label>
                    <select
                        id="task-select"
                        value={task}
                        onChange={(e) => setTask(e.target.value as AnalysisTask)}
                        className="w-full bg-slate-800/70 border border-slate-600 rounded-md p-2 text-sm"
                    >
                        <option value="summarize">{t('summarize')}</option>
                        <option value="comply">{t('checkCompliance')}</option>
                    </select>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !text.trim()}
                    className="w-full bg-cyan-600/50 hover:bg-cyan-600/80 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? t('analyzing') + '...' : <><BrainIcon className="w-5 h-5"/> {t('analyzeDocumentBtn')}</>}
                </button>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg flex flex-col">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">{t('analysisResult')}</h3>
                <div className="prose prose-sm prose-invert max-w-none prose-p:text-slate-300 prose-ul:text-slate-300 prose-strong:text-cyan-300 flex-grow h-80 overflow-y-auto pr-2">
                    {isLoading && <div className="text-center">{t('analyzing')}...</div>}
                    {error && <div className="text-red-400">{error}</div>}
                    {result ? <p className="whitespace-pre-wrap">{result}</p> : !isLoading && <p className="text-slate-500">Results will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

const DocumentPage: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<SubPage>('analysis');

    const TabButton: React.FC<{ tabName: SubPage; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors ${
                activeTab === tabName
                    ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-300'
                    : 'text-slate-400 hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('page_documents')}</h2>
            <div className="border-b border-cyan-400/20 flex space-x-4">
                <TabButton tabName="analysis" label={t('sub_documentAnalysis')} />
                <TabButton tabName="policies" label={t('sub_policyHub')} />
            </div>

            {activeTab === 'analysis' && <DocumentAnalysis />}
            {activeTab === 'policies' && <PoliciesModule />}
        </div>
    );
};

export default DocumentPage;