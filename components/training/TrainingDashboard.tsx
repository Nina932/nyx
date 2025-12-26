
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

// Mock data for the dashboard
const kpiData = {
    completionRate: 78,
    activeCourses: 5,
    employeesInTraining: 4,
};

interface KpiCardProps {
    title: string;
    value: string | number;
    unit?: string;
    onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit, onClick }) => {
    const Component = onClick ? 'button' : 'div';
    const classNames = `bg-slate-800/50 p-4 rounded-lg text-center w-full transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-slate-700/60 hover:border-cyan-400/50 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500' : ''}`;

    return (
        <Component className={classNames} onClick={onClick}>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider pointer-events-none">{title}</h3>
            <p className="text-3xl font-bold text-cyan-300 mt-2 pointer-events-none">
                {value}
                {unit && <span className="text-xl ml-1">{unit}</span>}
            </p>
        </Component>
    );
};


interface TrainingDashboardProps {
    onEmployeesInTrainingClick?: () => void;
}

export const TrainingDashboard: React.FC<TrainingDashboardProps> = ({ onEmployeesInTrainingClick }) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard title={t('overallCompletion')} value={kpiData.completionRate} unit="%" />
            <KpiCard title={t('activeCourses')} value={kpiData.activeCourses} />
            <KpiCard title={t('employeesInTraining')} value={kpiData.employeesInTraining} onClick={onEmployeesInTrainingClick} />
        </div>
    );
};