import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { BrainIcon } from '../components/icons/BrainIcon';
import { ArchitectureIcon } from '../components/icons/ArchitectureIcon';
import { GeminiIcon } from '../components/icons/GeminiIcon';
import { SitemapIcon } from '../components/icons/SitemapIcon';

const InfoCard: React.FC<{ titleKey: string; children: React.ReactNode; icon: React.ReactNode }> = ({ titleKey, children, icon }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-3">
                <div className="mr-4 text-cyan-400">{icon}</div>
                <h3 className="text-xl font-bold text-white">{t(titleKey as any)}</h3>
            </div>
            <div className="text-slate-300 space-y-2 text-sm">
                {children}
            </div>
        </div>
    );
};

const AgentCard: React.FC<{ title: string; description: string; }> = ({ title, description }) => (
    <div className="bg-slate-800/60 p-4 rounded-md">
        <h4 className="font-semibold text-cyan-300">{title}</h4>
        <p className="text-slate-400 text-xs mt-1">{description}</p>
    </div>
);

const AboutPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white">{t('about_title')}</h2>
                <p className="text-slate-400 mt-2">{t('about_intro')}</p>
            </div>

            <InfoCard titleKey="about_agent_ecosystem_title" icon={<BrainIcon className="w-8 h-8"/>}>
                <p className="text-slate-400 text-xs mb-4">{t('about_agent_ecosystem_desc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AgentCard title="CompetencyAI" description={t('about_agent_competency')} />
                    <AgentCard title="GrowthAI" description={t('about_agent_growth')} />
                    <AgentCard title="PolicyAI" description={t('about_agent_policy')} />
                    <AgentCard title="InsightAI" description={t('about_agent_insight')} />
                </div>
            </InfoCard>

            <InfoCard titleKey="about_orchestration_title" icon={<SitemapIcon className="w-8 h-8"/>}>
                 <p className="text-slate-400 text-xs">{t('about_orchestration_desc')}</p>
            </InfoCard>

            <InfoCard titleKey="about_tech_title" icon={<GeminiIcon className="w-8 h-8 text-purple-400"/>}>
                 <p className="text-slate-400 text-xs">{t('about_tech_gemini_desc')}</p>
            </InfoCard>
        </div>
    );
};

export default AboutPage;