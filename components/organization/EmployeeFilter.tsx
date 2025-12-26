
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

// FIX: Defined a strict type for the filters state.
interface Filters {
    searchTerm: string;
    hireDate: string;
    performanceRange: [number, number];
}

interface FilterProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const EmployeeFilter: React.FC<FilterProps> = ({ filters, setFilters }) => {
    const { t } = useTranslation();

    // FIX: Removed `any` type from setFilters callback.
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // FIX: Removed `any` type from setFilters callback.
    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setFilters((prev) => ({ ...prev, performanceRange: [value, prev.performanceRange[1]] }));
    };

    const handleReset = () => {
        setFilters({
            searchTerm: '',
            hireDate: '',
            performanceRange: [0, 100],
        });
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 shadow-lg space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
            <div className="flex-grow">
                <input
                    type="text"
                    name="searchTerm"
                    value={filters.searchTerm}
                    onChange={handleInputChange}
                    placeholder={t('filter_placeholder')}
                    className="w-full bg-slate-800/70 border border-slate-600 rounded-md p-2 text-sm"
                />
            </div>
            <div className="flex-grow">
                <label className="block text-xs text-slate-400 mb-1">{t('filter_hire_date')}</label>
                <input
                    type="date"
                    name="hireDate"
                    value={filters.hireDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800/70 border border-slate-600 rounded-md p-2 text-sm"
                />
            </div>
            <div className="flex-grow">
                <label className="block text-xs text-slate-400 mb-1">{t('filter_performance')}: {filters.performanceRange[0]}+</label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.performanceRange[0]}
                    onChange={handleRangeChange}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
            <button onClick={handleReset} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-700 text-sm w-full md:w-auto">
                {t('employees')} (Reset)
            </button>
        </div>
    );
};