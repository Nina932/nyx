
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Employee } from '../types';
import { PerformanceAnalysis } from '../components/ai/PerformanceAnalysis';
import { DashboardCard } from '../components/DashboardCard';

interface EmployeePersonalSpaceProps {
    employee: Employee;
    onBack: () => void;
}

const EmployeePersonalSpace: React.FC<EmployeePersonalSpaceProps> = ({ employee, onBack }) => {
    const { t, language } = useTranslation();

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300">&larr; {t('backToList')}</button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard titleKey='employeePersonalInfo'>
                    <h2 className="text-2xl font-bold text-white mb-1">{employee.name[language]}</h2>
                    <p className="text-md text-cyan-400 font-semibold mb-4">{employee.currentRole[language]}</p>
                    <div className="space-y-3 text-sm">
                        <div>
                            <h4 className="font-bold text-slate-400">{t('skillsToDevelop')}</h4>
                            <p className="text-slate-300">{employee.skills.join(', ')}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-400">Performance Score</h4>
                            <p className="text-slate-300">{employee.performanceScore} / 100</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-400">Career Goals</h4>
                           <p className="text-slate-300">{employee.careerGoals.map(g => g[language]).join(', ')}</p>
                        </div>
                    </div>
                </DashboardCard>
                 <DashboardCard titleKey='recentFeedback'>
                    <div className="h-full flex items-center">
                        <p className="text-slate-300 italic text-sm">"{employee.feedback[language]}"</p>
                    </div>
                </DashboardCard>
            </div>
            
            <PerformanceAnalysis 
                employeeName={employee.name[language]} 
                performanceData={employee.performanceData} 
                feedback={employee.feedback[language]}
            />

        </div>
    );
};

export default EmployeePersonalSpace;