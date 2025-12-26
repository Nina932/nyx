
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { analyzePerformance } from '../../services/geminiService';
import type { PerformanceData } from '../../types';
import { BrainIcon } from '../icons/BrainIcon';

interface PerformanceAnalysisProps {
    employeeName: string;
    performanceData: PerformanceData[];
    feedback: string;
}

interface AnalysisResult {
    burnoutRisk: 'Low' | 'Medium' | 'High';
    trend: string;
    recommendations: string[];
    sentiment: {
        score: number;
        label: 'Positive' | 'Neutral' | 'Negative';
    };
}

const riskStyles = {
    Low: 'bg-green-500/80 border-green-400 text-white',
    Medium: 'bg-yellow-500/80 border-yellow-400 text-white',
    High: 'bg-red-500/80 border-red-400 text-white',
};

const sentimentStyles = {
    Positive: 'text-green-400',
    Neutral: 'text-slate-400',
    Negative: 'text-red-400',
};


export const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({ employeeName, performanceData, feedback }) => {
    const { t } = useTranslation();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const analysisResult = await analyzePerformance(employeeName, performanceData, feedback);
            setResult(analysisResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">{t('performanceAnalysis')}</h3>
            {!result && !isLoading && (
                 <div className="text-center">
                    <p className="text-slate-400 mb-4">Get AI-driven insights into employee performance, wellbeing, and burnout risk based on the last 3 months of data and recent feedback.</p>
                    <button
                        onClick={handleAnalyze}
                        className="bg-cyan-600/50 hover:bg-cyan-600/80 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                       <BrainIcon className="w-5 h-5" /> {t('analyzePerformanceBtn')}
                    </button>
                </div>
            )}
             {isLoading && <div className="text-center text-slate-300">{t('analyzing')}...</div>}
             {error && <div className="text-center text-red-400">{error}</div>}

             {result && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t('burnoutRisk')}</h4>
                        <p className={`text-xl font-bold mt-2 px-3 py-1 rounded-full inline-block ${riskStyles[result.burnoutRisk]}`}>{result.burnoutRisk}</p>
                    </div>
                     <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t('performanceTrend')}</h4>
                        <p className="text-xl font-bold text-cyan-300 mt-2">{result.trend}</p>
                    </div>
                     <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t('sentimentLabel')}</h4>
                        <p className={`text-xl font-bold mt-2 ${sentimentStyles[result.sentiment.label]}`}>{result.sentiment.label}</p>
                    </div>
                     <div className="md:col-span-3 bg-slate-800/50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('aiRecommendations')}</h4>
                        <ul className="list-disc list-inside text-slate-300 space-y-1 text-sm">
                           {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ul>
                    </div>
                 </div>
             )}
        </div>
    )
}