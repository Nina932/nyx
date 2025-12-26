import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import SkillGapPage from './SkillGapPage';
import CompetencyPage from './CompetencyPage';
import CareerPathingModule from './CareerPathingPage';

type SubPage = 'skillGaps' | 'roleManagement' | 'careerPathing';

const TalentPage: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<SubPage>('skillGaps');

    const TabButton: React.FC<{ tabName: SubPage; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors ${
                activeTab === tabName
                    ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-300'
                    : 'text-slate-400 hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('page_talent')}</h2>
            <div className="border-b border-cyan-400/20 flex space-x-4">
                <TabButton tabName="skillGaps" label={t('sub_skillGaps')} />
                <TabButton tabName="roleManagement" label={t('sub_roleManagement')} />
                <TabButton tabName="careerPathing" label={t('sub_careerPathing')} />
            </div>

            {activeTab === 'skillGaps' && <SkillGapPage />}
            {activeTab === 'roleManagement' && <CompetencyPage />}
            {activeTab === 'careerPathing' && <CareerPathingModule />}
        </div>
    );
};

export default TalentPage;