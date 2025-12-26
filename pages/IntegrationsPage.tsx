
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { HrisIntegrations } from '../components/integrations/HrisIntegrations';
import { DataQueryAgent } from '../components/integrations/DataQueryAgent';

const IntegrationsPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">{t('page_integrations')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                   <HrisIntegrations />
                </div>
                <div>
                    <DataQueryAgent />
                </div>
            </div>
        </div>
    );
};

export default IntegrationsPage;