import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { AiAction } from '../../types';

interface ActionCardProps {
    action: AiAction;
    onApprove: () => void;
    onDismiss: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, onApprove, onDismiss }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-slate-800/70 p-4 rounded-lg border border-purple-500/50 shadow-lg animate-fade-in">
            <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-2">{t('aiProposedAction')}</h4>
            <div className="space-y-2 text-xs text-slate-300">
                <div>
                    <strong className="text-slate-400">{t('task')}:</strong>
                    <p>{action.task}</p>
                </div>
                <div className="flex justify-between">
                    <span><strong className="text-slate-400">{t('assignee')}:</strong> {action.assignee}</span>
                    <span><strong className="text-slate-400">{t('dueDate')}:</strong> {action.dueDate}</span>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button 
                    onClick={onDismiss}
                    className="px-3 py-1 text-xs font-semibold bg-slate-600/70 hover:bg-slate-500/70 rounded-md transition-colors"
                >
                    {t('dismiss')}
                </button>
                <button 
                    onClick={onApprove}
                    className="px-3 py-1 text-xs font-semibold bg-green-600/70 hover:bg-green-500/70 text-white rounded-md transition-colors"
                >
                    {t('approve')}
                </button>
            </div>
        </div>
    );
};