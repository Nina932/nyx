import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import type { SkillGap } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface SkillGapChartProps {
    data: SkillGap[];
}

const COLORS: Record<SkillGap['importance'], string> = {
    High: '#ef4444', // red-500
    Medium: '#f59e0b', // amber-500
    Low: '#3b82f6', // blue-500
};

const CustomTooltip = ({ active, payload, label }: any) => {
    const { t } = useTranslation();
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-md text-sm">
                <p className="font-bold text-cyan-400">{label}</p>
                <p className="text-slate-300">{`${t('gapCount')}: ${payload[0].value}`}</p>
                <p className="text-slate-300">{`Importance: ${payload[0].payload.importance}`}</p>
            </div>
        );
    }
    return null;
};

export const SkillGapChart: React.FC<SkillGapChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="skill" type="category" stroke="#9ca3af" fontSize={12} width={100} tick={{ fill: '#d1d5db' }} interval={0} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }}/>
                <Bar dataKey="gapCount" barSize={20}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.importance]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};
