
import React, { useState } from 'react';
import type { Employee, JobRole, SkillGap, AiAction } from '../types';
import { getSkillGapAnalysis, getGapClosureRecommendations } from '../services/geminiService';
import { getEmployees, getJobRoles } from '../services/api';
import { addApproval } from '../services/approvals';
import { useTranslation } from '../hooks/useTranslation';
import { BrainIcon } from '../components/icons/BrainIcon';
import { SkillGapChart } from '../components/talent/SkillGapChart';
import { DashboardCard } from '../components/DashboardCard';
import { ActionCard } from '../components/ai/ActionCard';

interface AnalysisResult {
    gaps: SkillGap[];
    recommendations: string;
    proposedAction: Omit<AiAction, 'id' | 'status'>;
}

export const SkillGapPage: React.FC = () => {
    const { t } = useTranslation();
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionVisible, setActionVisible] = useState(true);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setActionVisible(true);
        try {
            // Fetch fresh data from the API
            const employees = await getEmployees();
            const roles = await getJobRoles();

            const gaps = await getSkillGapAnalysis(employees, roles);
            if (gaps && gaps.length > 0) {
                const { recommendations, proposedAction } = await getGapClosureRecommendations(gaps);
                setAnalysisResult({ gaps, recommendations, proposedAction });
            } else {
                setAnalysisResult({ gaps: [], recommendations: t('noGapsFound'), proposedAction: { task: '', assignee: '', dueDate: '' } });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApproveAction = () => {
        if (analysisResult?.proposedAction) {
            addApproval(analysisResult.proposedAction);
            setActionVisible(false);
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-slate-400 max-w-3xl text-sm">
                {t('skillGapAnalysisDescription')}
            </p>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg min-h-[400px] flex flex-col justify-center">
                {!analysisResult && !isLoading && (
                    <div className="text-center">
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="bg-cyan-600/50 hover:bg-cyan-600/80 text-white font-bold py-3 px-6 rounded-md transition-all duration-300 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                        >
                            <BrainIcon className="w-5 h-5" />
                            {t('analyzeSkillGaps')}
                        </button>
                        {error && <div className="text-red-400 text-center p-4 text-sm">{error}</div>}
                    </div>
                )}
                {isLoading && (
                    <div className="flex items-center justify-center">
                        <div className="text-center text-slate-400 text-sm">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-200"></div>
                                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-400"></div>
                            </div>
                            <p className="mt-2">{t('analyzing')}...</p>
                        </div>
                    </div>
                )}
                {analysisResult && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                            <div className="lg:col-span-3">
                                <DashboardCard titleKey="skillGapChartTitle">
                                    {analysisResult.gaps.length > 0 ? (
                                        <SkillGapChart data={analysisResult.gaps} />
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-slate-400">{t('noGapsFound')}</div>
                                    )}
                                </DashboardCard>
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                <DashboardCard titleKey="aiStrategicPlan">
                                    <div className="prose prose-sm prose-invert max-w-none prose-p:text-slate-300 prose-ul:text-slate-300 h-[140px] overflow-y-auto pr-2">
                                        <div className="whitespace-pre-wrap">{analysisResult.recommendations}</div>
                                    </div>
                                </DashboardCard>
                                 {analysisResult.proposedAction?.task && actionVisible && (
                                     // FIX: The `ActionCard` component expects a full `AiAction` object, but `proposedAction` is missing `id` and `status`.
                                     // We create a new object spreading the existing properties and adding dummy/default values for the missing ones.
                                     <ActionCard 
                                         action={{
                                            ...analysisResult.proposedAction,
                                            id: 'temp-proposal-id',
                                            status: 'pending'
                                         }}
                                         onApprove={handleApproveAction}
                                         onDismiss={() => setActionVisible(false)}
                                     />
                                 )}
                            </div>
                        </div>
                         <div className="text-center">
                            <button onClick={handleAnalyze} disabled={isLoading} className="text-xs px-4 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded-md">Re-analyze</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillGapPage;