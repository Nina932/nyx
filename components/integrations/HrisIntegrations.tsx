
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const systems = [
    { name: 'SAP SuccessFactors', connected: true },
    { name: 'BambooHR', connected: true },
    { name: 'Odoo', connected: false },
    { name: '1C:Enterprise', connected: false },
];

export const HrisIntegrations: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-bold text-cyan-400 mb-1">{t('hris_integrations')}</h3>
            <p className="text-xs text-slate-400 mb-4">{t('hris_integrations_desc')}</p>
            <div className="space-y-3">
                {systems.map(system => (
                    <div key={system.name} className="flex items-center justify-between bg-slate-800/60 p-3 rounded-md">
                        <span className="font-semibold text-slate-300 text-sm">{system.name}</span>
                        {system.connected ? (
                            <span className="text-xs font-bold text-green-400 px-3 py-1 bg-green-500/20 rounded-full">{t('connected')}</span>
                        ) : (
                            <button className="text-xs font-semibold text-cyan-300 px-3 py-1 bg-cyan-600/50 hover:bg-cyan-600/80 rounded-full transition-colors">{t('connect')}</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};