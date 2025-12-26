
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { processDataQuery } from '../../services/geminiService';
import type { DataQueryResult } from '../../types';
import { BrainIcon } from '../icons/BrainIcon';

export const DataQueryAgent: React.FC = () => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<DataQueryResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showValidatedData, setShowValidatedData] = useState(false);

    const handleQuery = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        setShowValidatedData(false);
        try {
            const data = await processDataQuery(query);
            setResult(data);
            if (!data.validationError) {
                setShowValidatedData(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Query failed.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleProceed = () => {
        setShowValidatedData(true);
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg h-full">
            <h3 className="text-lg font-bold text-cyan-400 mb-1">{t('data_query_agent')}</h3>
            <p className="text-xs text-slate-400 mb-4">{t('data_query_agent_desc')}</p>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={t('ask_data_question')}
                        className="w-full bg-slate-800/70 border border-slate-600 rounded-md p-2 text-sm"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleQuery}
                        disabled={isLoading || !query.trim()}
                        className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm disabled:bg-slate-700 flex items-center gap-2"
                    >
                         <BrainIcon className="w-4 h-4"/>
                         {isLoading ? '...' : t('query')}
                    </button>
                </div>
                <div className="min-h-[300px]">
                    {isLoading && <div className="text-center text-sm text-slate-400">{t('analyzing')}...</div>}
                    {error && <div className="text-center text-sm text-red-400">{error}</div>}
                    {result && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-1">{t('ai_action_plan')}</h4>
                                <pre className="text-xs text-purple-300 bg-black/20 p-2 rounded-md overflow-x-auto whitespace-pre-wrap"><code>{result.plan}</code></pre>
                            </div>

                            {result.validationError && !showValidatedData && (
                                <div className="p-3 bg-yellow-900/50 border border-yellow-500/50 rounded-lg">
                                    <h4 className="text-sm font-semibold text-yellow-300 mb-2">{t('agent_validation')}</h4>
                                    <p className="text-xs text-yellow-200 mb-3">{t('validation_warning')}</p>
                                    <p className="text-xs font-mono bg-black/20 p-2 rounded-md text-yellow-200 mb-3">{result.validationError}</p>
                                    <button onClick={handleProceed} className="w-full text-xs px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-md">{t('proceed_anyway')}</button>
                                </div>
                            )}

                            {showValidatedData && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-1">{t('query_results')}</h4>
                                    <div className="overflow-x-auto border border-slate-700 rounded-md">
                                        <table className="w-full text-xs text-left text-slate-300">
                                            <thead className="text-cyan-400 uppercase bg-slate-800/60">
                                                <tr>
                                                    {result.result.length > 0 && Object.keys(result.result[0]).map(key => <th key={key} className="px-4 py-2">{key}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.result.map((row, index) => (
                                                    <tr key={index} className="border-b border-slate-700 last:border-b-0 hover:bg-slate-800/40">
                                                        {Object.values(row).map((val, i) => <td key={i} className="px-4 py-2">{String(val)}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};