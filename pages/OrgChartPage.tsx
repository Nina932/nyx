
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { OrgChartNode as OrgChartNodeType } from '../types';
import { OrgChartNode } from '../components/org/OrgChartNode';

interface OrgChartPageProps {
    orgData: OrgChartNodeType;
    onNodeClick: (nodeId: number) => void;
}

const OrgChartPage: React.FC<OrgChartPageProps> = ({ orgData, onNodeClick }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 lg:p-10 shadow-lg overflow-x-auto">
                <OrgChartNode node={orgData} isRoot onNodeClick={onNodeClick} />
            </div>
        </div>
    );
};

export default OrgChartPage;