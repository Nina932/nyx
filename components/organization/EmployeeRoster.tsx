import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { Employee } from '../../types';

interface EmployeeRosterProps {
    employees: Employee[];
    onViewEmployee: (employee: Employee) => void;
}

const gradeStyles: Record<string, string> = {
    'A': 'bg-green-500/80 border-green-400',
    'B': 'bg-sky-500/80 border-sky-400',
    'C': 'bg-yellow-500/80 border-yellow-400',
    'D': 'bg-orange-500/80 border-orange-400',
    'F': 'bg-red-500/80 border-red-400',
};


export const EmployeeRoster: React.FC<EmployeeRosterProps> = ({ employees, onViewEmployee }) => {
    const { t, language } = useTranslation();
    
    return (
         <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-cyan-400 uppercase bg-slate-800/60">
                    <tr>
                        <th scope="col" className="px-6 py-3">{t('employee_name')}</th>
                        <th scope="col" className="px-6 py-3">{t('employee_role')}</th>
                        <th scope="col" className="px-6 py-3">{t('employee_department')}</th>
                        <th scope="col" className="px-6 py-3">{t('employee_hire_date')}</th>
                        <th scope="col" className="px-6 py-3 text-center">{t('employee_performance')}</th>
                        <th scope="col" className="px-6 py-3 text-center">{t('employee_grade')}</th>
                        <th scope="col" className="px-6 py-3"></th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.id} className="border-b border-slate-700 hover:bg-slate-800/40">
                            <td className="px-6 py-4 font-medium whitespace-nowrap">{employee.name[language]}</td>
                            <td className="px-6 py-4">{employee.currentRole[language]}</td>
                            <td className="px-6 py-4">{employee.department[language]}</td>
                            <td className="px-6 py-4">{employee.hireDate}</td>
                            <td className="px-6 py-4 text-center">{employee.performanceScore}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`font-bold text-white text-xs px-2 py-0.5 rounded-full border ${gradeStyles[employee.grade] || 'bg-slate-600'}`}>
                                    {employee.grade}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => onViewEmployee(employee)}
                                    className="font-medium text-cyan-400 hover:underline"
                                >
                                    {t('viewProfile')}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
