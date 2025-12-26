
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';

export const ReportingPage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <ChartBarIcon className="w-24 h-24 text-cyan-400/50 mb-4" />
            <h2 className="text-2xl font-bold text-white">{t('reporting_placeholder_title')}</h2>
            <p className="text-slate-400 max-w-md mt-2">{t('reporting_placeholder_desc')}</p>
        </div>
    );
};

export default ReportingPage;