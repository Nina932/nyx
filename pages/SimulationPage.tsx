
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { SimulationScenario, SimulationStepResult } from '../types';
import { runBusinessSimulation } from '../services/geminiService';
import { BrainIcon } from '../components/icons/BrainIcon';

const scenarios: SimulationScenario[] = [
    {
        id: 'project_management',
        titleKey: 'scenario_project_title',
        initialPrompt: {
            en: "You are leading a critical project with a tight deadline. A key team member, Giorgi, seems disengaged and is falling behind, putting the project at risk. The team's morale is starting to dip.",
            ka: "თქვენ ხელმძღვანელობთ კრიტიკულ პროექტს, რომელსაც აქვს მოკლე ვადა. გუნდის მთავარი წევრი, გიორგი, დემოტივირებულია და უკან რჩება, რაც პროექტს რისკის ქვეშ აყენებს. გუნდის მორალი ეცემა."
        },
        initialChoices: [
            { textKey: 'choice_motivate', prompt: { en: 'Take Giorgi aside for a one-on-one motivational conversation to understand his challenges.', ka: 'გაიყვანეთ გიორგი ცალკე სამოტივაციო საუბარზე, რათა გაიგოთ მისი გამოწვევები.' } },
            { textKey: 'choice_demand', prompt: { en: 'Publicly address the deadline in a team meeting and demand higher performance from everyone.', ka: 'საჯაროდ ისაუბრეთ ვადებზე გუნდის შეხვედრაზე და ყველასგან მოითხოვეთ მაღალი პერფორმანსი.' } },
        ],
    },
];

const SimulationPage: React.FC = () => {
    const { t, language } = useTranslation();
    const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
    const [currentStep, setCurrentStep] = useState<SimulationStepResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStart = (scenario: SimulationScenario) => {
        setSelectedScenario(scenario);
        setCurrentStep(null);
        setError(null);
    };

    const handleChoice = async (choicePrompt: string) => {
        if (!selectedScenario) return;
        setIsLoading(true);
        setError(null);
        try {
            const scenarioPromptText = currentStep?.newSituation || selectedScenario.initialPrompt[language];
            const result = await runBusinessSimulation(scenarioPromptText, choicePrompt);
            setCurrentStep(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Simulation step failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestart = () => {
        setSelectedScenario(null);
        setCurrentStep(null);
        setError(null);
    };

    if (!selectedScenario) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">{t('selectScenario')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scenarios.map(sc => (
                        <div key={sc.id} className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-cyan-400">{t(sc.titleKey as any)}</h3>
                                <p className="text-slate-400 mt-2 text-sm">{sc.initialPrompt[language]}</p>
                            </div>
                            <button onClick={() => handleStart(sc)} className="mt-4 w-full bg-cyan-600/50 hover:bg-cyan-600/80 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                                {t('startSimulation')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    const choices = currentStep ? currentStep.newChoices : selectedScenario.initialChoices;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
             {/* FIX: Cast selectedScenario.titleKey to any to satisfy the type constraints of the t function. */}
             <h2 className="text-2xl font-bold text-white text-center">{t(selectedScenario.titleKey as any)}</h2>
             
             <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg space-y-4">
                {currentStep?.outcome && (
                    <div className="p-4 bg-slate-800/60 rounded-md border-l-4 border-purple-400">
                        <h3 className="font-bold text-purple-300">{t('outcome')}</h3>
                        <p className="text-slate-300 mt-1 text-sm">{currentStep.outcome}</p>
                    </div>
                )}
                 
                 <div className="p-4">
                     <h3 className="font-bold text-cyan-300">{currentStep ? t('nextSteps') : selectedScenario.initialPrompt[language]}</h3>
                     <p className="text-slate-300 mt-1 text-sm">{currentStep?.newSituation}</p>
                 </div>

                 <div className="border-t border-cyan-400/20 pt-4">
                     <h3 className="font-semibold text-slate-200 mb-2">{t('makeDecision')}:</h3>
                     {isLoading ? (
                         <div className="text-center text-sm text-slate-400">{t('analyzing')}...</div>
                     ) : error ? (
                         <div className="text-center text-sm text-red-400">{error}</div>
                     ) : choices && choices.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {choices.map(choice => (
                                 <button key={choice.textKey} onClick={() => handleChoice(choice.prompt[language])} className="p-4 bg-slate-800/70 hover:bg-slate-700/70 border border-slate-600 rounded-md text-left transition-colors">
                                     {/* FIX: Cast choice.textKey to any to satisfy the type constraints of the t function. */}
                                     <p className="font-semibold text-cyan-400">{t(choice.textKey as any)}</p>
                                     <p className="text-xs text-slate-400 mt-1">{choice.prompt[language]}</p>
                                 </button>
                             ))}
                         </div>
                     ) : (
                         <div className="text-center">
                             <p className="text-slate-300 mb-4">{t('simulationComplete')}</p>
                         </div>
                     )}
                 </div>
             </div>
              <div className="text-center">
                <button onClick={handleRestart} className="bg-slate-700/50 hover:bg-slate-700 text-cyan-300 font-semibold py-2 px-6 rounded-md text-sm transition-colors">
                     {t('restart')}
                 </button>
             </div>
        </div>
    );
};

export default SimulationPage;