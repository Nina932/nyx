
import React, { useState } from 'react';
import type { OrgChartNode as OrgChartNodeType } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface OrgChartNodeProps {
    node: OrgChartNodeType;
    isRoot?: boolean;
    onNodeClick: (nodeId: number) => void;
}

export const OrgChartNode: React.FC<OrgChartNodeProps> = ({ node, isRoot = false, onNodeClick }) => {
    const { language } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(isRoot);
    const hasReports = node.reports && node.reports.length > 0;

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent node click when toggling
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`flex flex-col items-center relative ${isRoot ? '' : 'pt-12'}`}>
            {/* Vertical line from parent's horizontal connector */}
            {!isRoot && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-cyan-700/50"></div>
            )}
            
            <div className="relative z-10">
                <div 
                    onClick={() => onNodeClick(node.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNodeClick(node.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View profile for ${node.name[language]}`}
                    className="flex flex-col items-center text-center p-4 bg-slate-800/70 rounded-lg border border-slate-600 shadow-md min-w-[200px] cursor-pointer hover:border-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
                >
                    {node.avatarUrl && (
                         <img src={node.avatarUrl} alt={node.name[language]} className="w-16 h-16 rounded-full border-2 border-cyan-400 mb-2 pointer-events-none"/>
                    )}
                    <h3 className="font-bold text-white pointer-events-none">{node.name[language]}</h3>
                    <p className="text-xs text-cyan-400 pointer-events-none">{node.role[language]}</p>
                </div>
                
                {hasReports && (
                    <button
                        onClick={handleToggleExpand}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? `Collapse reports for ${node.name[language]}` : `Expand reports for ${node.name[language]}`}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-700 border border-slate-500 rounded-full flex items-center justify-center text-xs text-cyan-300 hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 z-20"
                    >
                        {node.reports.length}
                    </button>
                )}
            </div>
            
            {hasReports && (
                <div className={`w-full transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
                    {/* Vertical line from node to children's horizontal connector */}
                    <div className="w-0.5 h-6 bg-cyan-700/50 mx-auto" />
                    
                    <div className="flex justify-center relative">
                        {/* Horizontal connector for children */}
                        {node.reports.length > 1 && (
                            <div 
                                className="absolute top-0 h-0.5 bg-cyan-700/50"
                                style={{
                                    left: `calc(100% / ${node.reports.length * 2})`,
                                    right: `calc(100% / ${node.reports.length * 2})`
                                }}
                            />
                        )}

                        {node.reports.map((report) => (
                            <div key={report.id} className="px-4 flex-shrink-0">
                                <OrgChartNode node={report} onNodeClick={onNodeClick} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};