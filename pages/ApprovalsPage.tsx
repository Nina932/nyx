import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { getApprovals, updateApprovalStatus } from '../services/approvals';
import type { AiAction } from '../types';

const StatusBadge: React.FC<{ status: AiAction['status'] }> = ({ status }) => {
    const { t } = useTranslation();
    const styles = {
        pending: 'bg-yellow-500/80 border-yellow-400',
        approved: 'bg-green-500/80 border-green-400',
        rejected: 'bg-red-500/80 border-red-400',
    };
    const textKey = `status_${status}` as const;
    return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border text-white ${styles[status]}`}>{t(textKey)}</span>
};

const ApprovalsPage: React.FC = () => {
    const { t } = useTranslation();
    const [actions, setActions] = useState<AiAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActions = async () => {
        setIsLoading(true);
        try {
            const data = await getApprovals();
            setActions(data.sort((a, b) => a.status === 'pending' ? -1 : 1)); // Keep pending at top
        } catch (error) {
            console.error("Failed to fetch approvals:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActions();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateApprovalStatus(id, status);
            fetchActions(); // Refresh list after update
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('approvals_title')}</h2>
            <p className="text-slate-400 max-w-2xl text-sm">{t('approvals_desc')}</p>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg shadow-lg overflow-x-auto">
                {isLoading ? (
                    <div className="text-center p-8 text-slate-400">{t('analyzing')}...</div>
                ) : actions.length === 0 ? (
                    <div className="text-center p-8 text-slate-500">{t('no_pending_actions')}</div>
                ) : (
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-cyan-400 uppercase bg-slate-800/60">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('action_task')}</th>
                                <th scope="col" className="px-6 py-3">{t('action_assignee')}</th>
                                <th scope="col" className="px-6 py-3">{t('action_due_date')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('action_status')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actions.map(action => (
                                <tr key={action.id} className="border-b border-slate-700 hover:bg-slate-800/40">
                                    <td className="px-6 py-4 font-medium">{action.task}</td>
                                    <td className="px-6 py-4">{action.assignee}</td>
                                    <td className="px-6 py-4">{action.dueDate}</td>
                                    <td className="px-6 py-4 text-center"><StatusBadge status={action.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        {action.status === 'pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(action.id, 'rejected')}
                                                    className="px-3 py-1 text-xs font-semibold bg-red-600/70 hover:bg-red-500/70 text-white rounded-md transition-colors"
                                                >
                                                    {t('action_reject')}
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(action.id, 'approved')}
                                                    className="px-3 py-1 text-xs font-semibold bg-green-600/70 hover:bg-green-500/70 text-white rounded-md transition-colors"
                                                >
                                                    {t('action_approve')}
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500 italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ApprovalsPage;