
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { suggestTrainingPrograms } from '../../services/geminiService';
import type { TrainingCourse } from '../../types';
import { BrainIcon } from '../icons/BrainIcon';
import { TrainingIcon } from '../icons/TrainingIcon';

export const AiTrainingSuggester: React.FC = () => {
    const { t } = useTranslation();
    const [skill, setSkill] = useState('');
    const [suggestions, setSuggestions] = useState<Omit<TrainingCourse, 'id'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSuggest = async () => {
        if (!skill.trim()) return;
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        try {
            const result = await suggestTrainingPrograms(skill);
            setSuggestions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get suggestions.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    placeholder={t('skillPlaceholder')}
                    className="w-full bg-slate-800/70 border border-slate-600 rounded-md p-2 text-sm"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSuggest}
                    disabled={isLoading || !skill.trim()}
                    className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm disabled:bg-slate-700 flex items-center gap-2"
                >
                    <BrainIcon className="w-4 h-4" />
                    {isLoading ? t('suggesting') : t('suggest')}
                </button>
            </div>
            <div className="min-h-[150px]">
                {isLoading && <div className="text-center text-sm text-slate-400">{t('suggesting')}...</div>}
                {error && <div className="text-center text-sm text-red-400">{error}</div>}
                {suggestions.length > 0 && (
                    <div className="space-y-3">
                        {suggestions.map((course, index) => (
                            <div key={index} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                                <h4 className="font-semibold text-cyan-400 flex items-center gap-2"><TrainingIcon className="w-4 h-4"/>{course.title}</h4>
                                <p className="text-xs text-slate-400"><strong>Provider:</strong> {course.provider}</p>
                                <p className="text-xs text-slate-400"><strong>Duration:</strong> {course.duration}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};