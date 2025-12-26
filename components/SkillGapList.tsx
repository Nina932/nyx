
import React from 'react';
import type { SkillGap } from '../types';
import { TargetIcon } from './icons/TargetIcon';
import { TrainingIcon } from './icons/TrainingIcon';
import { useTranslation } from '../hooks/useTranslation';

const importanceClasses: Record<SkillGap['importance'], { text: string; style: string }> = {
    High: { text: 'high', style: 'bg-red-500/80 border-red-400' },
    Medium: { text: 'medium', style: 'bg-yellow-500/80 border-yellow-400' },
    Low: { text: 'low', style: 'bg-sky-500/80 border-sky-400' },
};

export const SkillGapList: React.FC<{ gaps: SkillGap[] }> = ({ gaps }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-3 pr-2">
            {gaps.map((gap, index) => {
                const importanceInfo = importanceClasses[gap.importance] || importanceClasses.Low;
                return (
                    <div key={index} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-slate-200 flex items-center">
                                    <TargetIcon className="w-4 h-4 mr-2 text-cyan-300"/>{gap.skill}
                                </h3>
                                 <p className="text-xs text-slate-400">
                                    {t('gapCount')}: <span className="font-bold text-slate-300">{gap.gapCount} {t('employees')}</span>
                                </p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border text-white ${importanceInfo.style}`}>
                                {/* FIX: Cast importanceInfo.text to any to satisfy the type constraints of the t function. */}
                                {t(importanceInfo.text as any)}
                            </span>
                        </div>
                        <div className="mt-2 border-t border-slate-600/50 pt-2">
                            <h4 className="text-xs font-semibold flex items-center text-slate-300">
                               <TrainingIcon className="w-3 h-3 mr-2 text-purple-300"/> {t('suggestedTraining')}
                            </h4>
                            <ul className="list-disc list-inside text-xs text-slate-400 mt-1 pl-2 space-y-0.5">
                                {gap.recommendedTraining.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};