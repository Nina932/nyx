import React, { useState } from 'react';
import { NyxLogo } from '../icons/NyxLogo';
import { DashboardIcon } from '../icons/DashboardIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { TrainingIcon } from '../icons/TrainingIcon';
import { CubeTransparentIcon } from '../icons/CubeTransparentIcon';
import { InformationCircleIcon } from '../icons/InformationCircleIcon';
import { CloudArrowUpIcon } from '../icons/CloudArrowUpIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';
import { Page } from '../../App';
import { useTranslation } from '../../hooks/useTranslation';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    isExpanded: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, isExpanded, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center h-12 px-4 rounded-lg transition-all duration-200 ease-in-out overflow-hidden ${isActive
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
    >
        <div className="flex-shrink-0">{icon}</div>
        <span className={`ml-4 font-semibold whitespace-nowrap transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
);

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const navItems: { page: Page; labelKey: string; icon: React.ReactNode }[] = [
        { page: 'dashboard', labelKey: 'nav_dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
        { page: 'organization', labelKey: 'nav_organization', icon: <UsersIcon className="w-6 h-6" /> },
        { page: 'talent', labelKey: 'nav_talent', icon: <BriefcaseIcon className="w-6 h-6" /> },
        { page: 'training', labelKey: 'nav_training', icon: <TrainingIcon className="w-6 h-6" /> },
        { page: 'approvals', labelKey: 'nav_approvals', icon: <CheckBadgeIcon className="w-6 h-6" /> },
        { page: 'simulation', labelKey: 'nav_simulation', icon: <CubeTransparentIcon className="w-6 h-6" /> },
        { page: 'documents', labelKey: 'nav_documents', icon: <DocumentTextIcon className="w-6 h-6" /> },
        { page: 'integrations', labelKey: 'nav_integrations', icon: <CloudArrowUpIcon className="w-6 h-6" /> },
        { page: 'reporting', labelKey: 'nav_reporting', icon: <ChartBarIcon className="w-6 h-6" /> },
        { page: 'admin' as Page, labelKey: 'nav_admin', icon: <ChartBarIcon className="w-6 h-6" /> },
    ];

    return (
        <aside
            className={`bg-slate-900/50 backdrop-blur-sm border-r border-cyan-400/20 p-4 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <button
                onClick={() => setCurrentPage('about')}
                className={`flex items-center justify-center mb-10 transition-all duration-300 ${isExpanded ? 'h-24' : 'h-12'}`}
                aria-label={t('page_about')}
            >
                <NyxLogo className={`transition-all duration-300 ${isExpanded ? 'w-24 h-24' : 'w-12 h-12'}`} />
            </button>

            <nav className="flex-grow">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <li key={item.page}>
                            <NavItem
                                label={t(item.labelKey as any)}
                                icon={item.icon}
                                isActive={currentPage === item.page}
                                isExpanded={isExpanded}
                                onClick={() => setCurrentPage(item.page)}
                            />
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="border-t border-slate-700/50 pt-2 mt-4">
                <NavItem
                    label={t('nav_about')}
                    icon={<InformationCircleIcon className="w-6 h-6" />}
                    isActive={currentPage === 'about'}
                    isExpanded={isExpanded}
                    onClick={() => setCurrentPage('about')}
                />
            </div>

            <div className={`text-center text-xs text-slate-500 transition-opacity duration-200 mt-4 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                <p>NYX Hybrid Apps</p>
                <p>&copy; 2025</p>
            </div>
        </aside>
    );
};