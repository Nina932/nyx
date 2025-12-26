import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { CardSkeleton } from '../components/ui/Skeleton';

interface UsageRecord {
    id: number;
    endpoint: string;
    tokens: number;
    cost: number;
    createdAt: string;
}

interface UsageStats {
    totalCalls: number;
    totalTokens: number;
    totalCost: number;
    callsByEndpoint: { endpoint: string; count: number }[];
    callsByDay: { date: string; calls: number; cost: number }[];
}

const COLORS = ['#00d4ff', '#7c3aed', '#ff00ff', '#22c55e', '#f59e0b', '#ef4444'];

const AdminDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { token, user } = useAuth();
    const [usage, setUsage] = useState<UsageRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsage();
    }, []);

    const fetchUsage = async () => {
        try {
            const response = await fetch('/api/ai/usage', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch usage data');
            const data = await response.json();
            setUsage(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats from usage data
    const stats: UsageStats = React.useMemo(() => {
        const callsByEndpoint: Record<string, number> = {};
        const callsByDay: Record<string, { calls: number; cost: number }> = {};

        usage.forEach((record) => {
            // By endpoint
            callsByEndpoint[record.endpoint] = (callsByEndpoint[record.endpoint] || 0) + 1;

            // By day
            const date = new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!callsByDay[date]) callsByDay[date] = { calls: 0, cost: 0 };
            callsByDay[date].calls += 1;
            callsByDay[date].cost += record.cost;
        });

        return {
            totalCalls: usage.length,
            totalTokens: usage.reduce((sum, r) => sum + r.tokens, 0),
            totalCost: usage.reduce((sum, r) => sum + r.cost, 0),
            callsByEndpoint: Object.entries(callsByEndpoint).map(([endpoint, count]) => ({ endpoint, count })),
            callsByDay: Object.entries(callsByDay).map(([date, data]) => ({ date, ...data })),
        };
    }, [usage]);

    if (user?.role !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
                    <p className="text-slate-400">Only administrators can access this page.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Data</h2>
                    <p className="text-slate-400">{error}</p>
                    <button onClick={fetchUsage} className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Admin Dashboard - AI Cost Tracking</h1>
                <button
                    onClick={fetchUsage}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors"
                >
                    Refresh Data
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6">
                    <p className="text-sm text-slate-400 mb-1">Total API Calls</p>
                    <p className="text-3xl font-bold text-cyan-400">{stats.totalCalls}</p>
                    <p className="text-xs text-slate-500 mt-2">All time</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-400/20 rounded-lg p-6">
                    <p className="text-sm text-slate-400 mb-1">Total Tokens</p>
                    <p className="text-3xl font-bold text-purple-400">{stats.totalTokens.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-2">Input tokens processed</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-green-400/20 rounded-lg p-6">
                    <p className="text-sm text-slate-400 mb-1">Estimated Cost</p>
                    <p className="text-3xl font-bold text-green-400">${stats.totalCost.toFixed(4)}</p>
                    <p className="text-xs text-slate-500 mt-2">Based on usage</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-orange-400/20 rounded-lg p-6">
                    <p className="text-sm text-slate-400 mb-1">Rate Limit</p>
                    <p className="text-3xl font-bold text-orange-400">10/hr</p>
                    <p className="text-xs text-slate-500 mt-2">Per user (free tier)</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Over Time */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Usage Over Time</h3>
                    {stats.callsByDay.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={stats.callsByDay}>
                                <defs>
                                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="calls" stroke="#00d4ff" fillOpacity={1} fill="url(#colorCalls)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-slate-500">
                            No usage data yet
                        </div>
                    )}
                </div>

                {/* Calls by Endpoint */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Calls by Endpoint</h3>
                    {stats.callsByEndpoint.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats.callsByEndpoint} layout="vertical">
                                <XAxis type="number" stroke="#64748b" fontSize={12} />
                                <YAxis
                                    type="category"
                                    dataKey="endpoint"
                                    stroke="#64748b"
                                    fontSize={12}
                                    width={100}
                                    tickFormatter={(value) => value.replace('api/ai/', '')}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-slate-500">
                            No usage data yet
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent API Calls</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-400 border-b border-slate-700">
                                <th className="pb-3 font-medium">Endpoint</th>
                                <th className="pb-3 font-medium">Tokens</th>
                                <th className="pb-3 font-medium">Cost</th>
                                <th className="pb-3 font-medium">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usage.slice(0, 10).map((record) => (
                                <tr key={record.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="py-3">
                                        <code className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-300">
                                            {record.endpoint}
                                        </code>
                                    </td>
                                    <td className="py-3 text-slate-300">{record.tokens.toLocaleString()}</td>
                                    <td className="py-3 text-green-400">${record.cost.toFixed(6)}</td>
                                    <td className="py-3 text-slate-400">
                                        {new Date(record.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {usage.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-500">
                                        No API calls recorded yet. Start using the AI features!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
