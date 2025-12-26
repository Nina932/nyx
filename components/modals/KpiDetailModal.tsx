import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { BrainIcon } from '../icons/BrainIcon';
import type { HighPotentialEmployee, ManagerInTraining, HrMetricsData } from '../../types';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';

interface KpiDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any;
    aiAnalysis: string;
    isLoadingAi: boolean;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-slate-400 hover:text-white'}`}
    >
        {label}
    </button>
);

const ReadinessBar: React.FC<{ score: number }> = ({ score }) => {
    const getColor = (s: number) => {
        if (s >= 90) return 'bg-green-500';
        if (s >= 70) return 'bg-sky-500';
        if (s >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className={`${getColor(score)} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
    );
};

export const KpiDetailModal: React.FC<KpiDetailModalProps> = ({ isOpen, onClose, title, data, aiAnalysis, isLoadingAi }) => {
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'breakdown'>('overview');
    
    useEffect(() => {
        // Reset to default tab when data changes
        setActiveTab('overview');
    }, [data]);

    if (!isOpen) return null;

    const hasEmployeeData = data.highPotentials && data.managersInTraining;
    const hasBreakdownData = data.breakdown;

    const renderTabs = () => {
        const tabs = [{ key: 'overview', label: t('overview') }];
        if (hasEmployeeData) tabs.push({ key: 'employees', label: t('employees') });
        if (hasBreakdownData) tabs.push({ key: 'breakdown', label: t('breakdown') });
        
        if (tabs.length <= 1) return null;

        return (
             <div className="border-b border-cyan-400/20 mb-4 flex space-x-2">
                {tabs.map(tab => (
                    <TabButton 
                        key={tab.key}
                        label={tab.label} 
                        isActive={activeTab === tab.key} 
                        onClick={() => setActiveTab(tab.key as any)} 
                    />
                ))}
            </div>
        )
    }

    const renderOverview = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(data.summary).map(([key, item]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-md text-sm">
                        <span className="text-slate-300">{t(key as any)}</span>
                        <strong className="text-white font-bold text-lg">
                            {item.value}
                            {item.unit && <span className="text-sm ml-1 font-normal text-slate-400">{item.unit}</span>}
                        </strong>
                    </div>
                ))}
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border-t-2 border-purple-400/50">
                <h4 className="text-md font-bold text-purple-300 flex items-center gap-2 mb-2">
                    <BrainIcon className="w-5 h-5" />
                    {t('kpi_ai_analysis')}
                </h4>
                {isLoadingAi ? (
                    <div className="text-sm text-slate-400 animate-pulse">{t('analyzing')}...</div>
                ) : (
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{aiAnalysis}</p>
                )}
            </div>
        </div>
    );

    const renderEmployees = () => (
         <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <div>
                <h4 className="font-bold text-cyan-300 mb-2">{t('highPotentialEmployees')}</h4>
                <div className="space-y-2">
                {data.highPotentials.map((emp: HighPotentialEmployee) => (
                    <div key={emp.id} className="bg-slate-800/50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-slate-200">{emp.name[language]}</p>
                                <p className="text-xs text-slate-400">{emp.currentRole[language]} - {emp.department[language]}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">{t('readiness')}</p>
                                <p className="font-bold text-white text-sm">{emp.digitalTwin.readiness.score}%</p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <ReadinessBar score={emp.digitalTwin.readiness.score} />
                        </div>
                    </div>
                ))}
                </div>
            </div>
             <div>
                <h4 className="font-bold text-cyan-300 mb-2">{t('managersInTraining')}</h4>
                 <div className="space-y-2">
                {data.managersInTraining.map((emp: ManagerInTraining) => (
                    <div key={emp.id} className="bg-slate-800/50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-slate-200">{emp.name[language]}</p>
                                <p className="text-xs text-slate-400">{emp.currentRole[language]} - {emp.department[language]}</p>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );

    const renderBreakdown = () => (
         <div className="space-y-4">
             <h4 className="font-bold text-cyan-300 mb-2">{t('trainingHoursByDept')}</h4>
             <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.breakdown.trainingHoursByDept} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <YAxis dataKey="dept" type="category" stroke="#9ca3af" fontSize={12} width={80} tick={{ fill: '#d1d5db' }} interval={0} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
                    <Bar dataKey="hours" barSize={20} fill="#22d3ee" />
                </BarChart>
            </ResponsiveContainer>
         </div>
    );

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-cyan-400/50 rounded-lg shadow-2xl p-6 w-full max-w-2xl animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                
                {renderTabs()}

                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'employees' && hasEmployeeData && renderEmployees()}
                {activeTab === 'breakdown' && hasBreakdownData && renderBreakdown()}
            </div>
        </div>
    );
};