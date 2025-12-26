
import React, { useState, useEffect } from 'react';
import type { Employee, CareerPath } from '../types';
import { getCareerPath } from '../services/geminiService';
import { getEmployees } from '../services/api';
import { CareerPathVisualizer } from './CareerPathVisualizer';
import { useTranslation } from '../hooks/useTranslation';

export const CareerPathing: React.FC = () => {
    const { t, language } = useTranslation();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingEmployees, setIsFetchingEmployees] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const fetchedEmployees = await getEmployees();
                setEmployees(fetchedEmployees);
            } catch (err) {
                setError("Failed to load employees.");
            } finally {
                setIsFetchingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleEmployeeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const employeeId = parseInt(e.target.value, 10);
        if (isNaN(employeeId)) {
            setSelectedEmployeeId(null);
            setCareerPath(null);
            return;
        }

        setSelectedEmployeeId(employeeId);
        const employee = employees.find(emp => emp.id === employeeId);

        if (employee) {
            setIsLoading(true);
            setError(null);
            setCareerPath(null);
            try {
                const result = await getCareerPath(employee);
                setCareerPath(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <label htmlFor="employee-select" className="block text-sm font-medium text-slate-400 mb-1">
                    {t('selectEmployee')}
                </label>
                <select
                    id="employee-select"
                    onChange={handleEmployeeChange}
                    defaultValue=""
                    className="w-full bg-slate-800/70 border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                    disabled={isFetchingEmployees || isLoading}
                >
                    <option value="" disabled>{isFetchingEmployees ? "Loading..." : t('chooseEmployeePrompt')}</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name[language]} - {emp.currentRole[language]}</option>
                    ))}
                </select>
            </div>
            <div className="flex-grow overflow-y-auto">
                {isLoading && (
                     <div className="flex items-center justify-center h-full">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-200"></div>
                            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-400"></div>
                            <span className="ml-2 text-slate-300">{t('generatingCareerPath')}</span>
                        </div>
                    </div>
                )}
                {error && <div className="text-red-400 text-center p-4">{error}</div>}
                {careerPath && <CareerPathVisualizer path={careerPath} />}
                {!selectedEmployeeId && !isLoading && (
                    <div className="text-center text-slate-400 h-full flex items-center justify-center">
                        <p>{t('selectEmployeePrompt')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};