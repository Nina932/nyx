
import React from 'react';
import type { CareerPath, CareerStep } from '../types';
import { RoadmapIcon } from './icons/RoadmapIcon';
import { SkillIcon } from './icons/SkillIcon';
import { TrainingIcon } from './icons/TrainingIcon';
import { useTranslation } from '../hooks/useTranslation';

const CareerStepCard: React.FC<{ step: CareerStep; isFirst: boolean }> = ({ step, isFirst }) => {
    const { t } = useTranslation();
    return (
    <div className="relative pl-8">
        {!isFirst && <div className="absolute left-3.5 top-0 w-0.5 h-6 bg-cyan-700"></div>}
        <div className="absolute left-0 top-6 w-8 flex justify-center">
            <div className="w-0.5 h-full bg-cyan-700"></div>
        </div>

        <div className="absolute left-0 top-6 -translate-x-1/2 -translate-y-1/2">
             <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border-2 border-cyan-600">
                <RoadmapIcon className="w-5 h-5 text-cyan-400"/>
            </div>
        </div>

        <div className="ml-6 mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="font-bold text-cyan-400 text-md">{step.role}</h3>
            <p className="text-xs text-slate-400 italic mt-1 mb-3">{step.description}</p>
            
            <div className="space-y-2">
                <div>
                    <h4 className="text-sm font-semibold flex items-center text-slate-300"><SkillIcon className="w-4 h-4 mr-2 text-pink-400" /> {t('skillsToDevelop')}</h4>
                    <ul className="list-disc list-inside text-xs text-slate-400 mt-1 pl-2 space-y-1">
                        {step.skillsToDevelop.map((skill, i) => <li key={i}>{skill}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-semibold flex items-center text-slate-300"><TrainingIcon className="w-4 h-4 mr-2 text-purple-400" /> {t('recommendedTraining')}</h4>
                     <ul className="list-disc list-inside text-xs text-slate-400 mt-1 pl-2 space-y-1">
                        {step.recommendedTraining.map((training, i) => <li key={i}>{training}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    </div>
)};


export const CareerPathVisualizer: React.FC<{ path: CareerPath }> = ({ path }) => {
    const { t } = useTranslation();
    return (
        <div>
            <div className="mb-4 pl-8">
                <h3 className="font-semibold text-slate-300">{t('currentRole')}: <span className="text-cyan-400 font-bold">{path.currentRole}</span></h3>
            </div>
            <div>
                {path.suggestedPath.map((step, index) => (
                    <CareerStepCard key={index} step={step} isFirst={index === 0} />
                ))}
            </div>
        </div>
    );
};