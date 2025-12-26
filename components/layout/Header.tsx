import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Page } from '../../App';

interface HeaderProps {
    currentPage: Page;
}

export const Header: React.FC<HeaderProps> = ({ currentPage }) => {
    const { t, language, setLanguage } = useTranslation();

    const pageTitles: Record<Page, string> = {
        dashboard: t('page_dashboard'),
        organization: t('page_organization'),
        talent: t('page_talent'),
        training: t('page_training'),
        simulation: t('page_simulation'),
        documents: t('page_documents'),
        integrations: t('page_integrations'),
        reporting: t('page_reporting'),
        approvals: t('page_approvals'),
        admin: t('page_admin'),
        about: t('page_about'),
    };

    return (
        <header className="flex items-center justify-between p-4 bg-slate-900/30 backdrop-blur-sm border-b border-cyan-400/20 flex-shrink-0">
            <div>
                <h1 className="text-xl font-bold text-white tracking-wider">{pageTitles[currentPage]}</h1>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 rounded-md transition-colors text-sm flex items-center gap-2 ${language === 'en' ? 'bg-cyan-500/50' : 'hover:bg-slate-700/50'}`}
                    aria-label="Switch to English"
                >
                    <span role="img" aria-label="UK Flag">🇬🇧</span> EN
                </button>
                <button
                    onClick={() => setLanguage('ka')}
                    className={`px-2 py-1 rounded-md transition-colors text-sm flex items-center gap-2 ${language === 'ka' ? 'bg-cyan-500/50' : 'hover:bg-slate-700/50'}`}
                    aria-label="Switch to Georgian"
                >
                    <span role="img" aria-label="Georgia Flag">🇬🇪</span> KA
                </button>
            </div>
        </header>
    );
};