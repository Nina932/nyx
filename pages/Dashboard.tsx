import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardCard } from '../components/DashboardCard';
import { Chatbot } from '../components/Chatbot';
import { Page } from '../App';
import { useTranslation } from '../hooks/useTranslation';
import { analyzeRevenueTrend, getKpiAnalysis } from '../services/geminiService';
import { getEmployees, getHrMetrics } from '../services/api';
import type { Employee, HighPotentialEmployee, ManagerInTraining, HrMetricsData } from '../types';
import { KpiDetailModal } from '../components/modals/KpiDetailModal';

const revenueTrendData = [
  { name: 'Jan', value: 2400 }, { name: 'Feb', value: 2210 }, { name: 'Mar', value: 2290 },
  { name: 'Apr', value: 2000 }, { name: 'May', value: 2181 }, { name: 'Jun', value: 2500 },
  { name: 'Jul', value: 2100 },
];

const agentStatusData = [
    { name: 'CompetencyAI', status: 'Operational' },
    { name: 'GrowthAI', status: 'Operational' },
    { name: 'PolicyAI', status: 'Standby' },
    { name: 'InsightAI', status: 'Active' },
    { name: 'OpsAI', status: 'Idle' },
];

interface DashboardProps {
    setCurrentPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
    const { t, language } = useTranslation();
    const [revenueAnalysis, setRevenueAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [hrMetrics, setHrMetrics] = useState<HrMetricsData | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<any>({ titleKey: '', data: {}, analysis: '' });
    const [isAnalyzingKpi, setIsAnalyzingKpi] = useState(false);
    
    const [currentTwinIndex, setCurrentTwinIndex] = useState(0);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [analysis, emps, metrics] = await Promise.all([
                    analyzeRevenueTrend(),
                    getEmployees(),
                    getHrMetrics()
                ]);
                setRevenueAnalysis(analysis);
                setEmployees(emps);
                setHrMetrics(metrics);
            } catch (error) {
                setRevenueAnalysis(t('analysisError'));
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [t]);

    const { leadershipData, highPotentials } = useMemo(() => {
        const highPots = employees
            .filter(e => e.digitalTwin.readiness.score >= 85)
            .sort((a, b) => b.digitalTwin.readiness.score - a.digitalTwin.readiness.score) as HighPotentialEmployee[];
        const managersInTraining = employees
            .filter(e => e.currentRole.en.includes('Lead') || e.currentRole.en.includes('Manager')) as ManagerInTraining[];
        
        const data = {
            summary: {
                successionReadiness: { value: 72, unit: '%' },
                managersInTraining: { value: managersInTraining.length },
                highPotentialEmployees: { value: highPots.length },
            },
            highPotentials: highPots,
            managersInTraining: managersInTraining,
        };
        return { leadershipData: data, highPotentials: highPots };
    }, [employees]);

    useEffect(() => {
        if (highPotentials.length > 0) {
            const interval = setInterval(() => {
                setCurrentTwinIndex(prev => (prev + 1) % highPotentials.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [highPotentials]);

    const handleOpenKpiModal = async (type: 'leadership' | 'metrics') => {
        const isLeadership = type === 'leadership';
        const titleKey = isLeadership ? 'kpi_modal_title_leadership' : 'kpi_modal_title_metrics';
        const data = isLeadership ? leadershipData : hrMetrics;
        
        if (!data) return;

        setModalContent({ titleKey, data, analysis: '' });
        setIsModalOpen(true);
        setIsAnalyzingKpi(true);

        try {
            const analysis = await getKpiAnalysis(t(titleKey as any), data);
            setModalContent(prev => ({ ...prev, analysis }));
        } catch (error) {
            console.error(error);
            setModalContent(prev => ({ ...prev, analysis: t('analysisError') }));
        } finally {
            setIsAnalyzingKpi(false);
        }
    };
    
    const currentTwin = highPotentials[currentTwinIndex];
  
  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      
      {/* Left Column - Org Health */}
      <div className="lg:col-span-1 space-y-6 flex flex-col">
        <DashboardCard titleKey="revenueTrend" className="flex-grow flex flex-col">
          <p className="text-xl font-bold">2.13M <span className="text-sm font-normal text-gray-400">GEL</span></p>
          {isLoading ? (
             <div className="text-xs text-slate-400 italic mt-2 animate-pulse">{t('analyzing')}...</div>
          ) : (
             <p className="text-xs text-slate-300 italic mt-2 p-2 bg-slate-800/50 rounded-md">{revenueAnalysis}</p>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#82ca9d" stopOpacity={0.4}/><stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="name" stroke="#4B5563" fontSize={12} /><YAxis stroke="#4B5563" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} cursor={{stroke: '#82ca9d', strokeWidth: 1}}/>
              <Area type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
        
        <DashboardCard titleKey="keyHrMetrics" onClick={() => handleOpenKpiModal('metrics')}>
            {hrMetrics ? (
            <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center"><span>{t('turnoverRate')}</span><strong className="text-cyan-300">{hrMetrics.summary.turnoverRate.value}{hrMetrics.summary.turnoverRate.unit}</strong></li>
                <li className="flex justify-between items-center"><span>{t('engagementScore')}</span><strong className="text-cyan-300">{hrMetrics.summary.engagementScore.value}{hrMetrics.summary.engagementScore.unit}</strong></li>
                <li className="flex justify-between items-center"><span>{t('onboardingCost')}</span><strong className="text-cyan-300">{hrMetrics.summary.onboardingCost.value}</strong></li>
            </ul>
             ) : (<div className="text-slate-400 text-xs">{t('analyzing')}...</div>)}
        </DashboardCard>
      </div>

      {/* Center - AI Core */}
      <div className="lg:col-span-1 space-y-6 flex flex-col">
        <div className="flex-1 min-h-[400px] lg:min-h-0 order-first lg:order-none">
            <Chatbot />
        </div>
         <DashboardCard titleKey="aiAgentStatus">
             <ul className="space-y-1 text-xs">
                {agentStatusData.map(agent => (
                    <li key={agent.name} className="flex justify-between items-center">
                        <span className="font-semibold text-slate-300">{agent.name}</span>
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${agent.status === 'Operational' || agent.status === 'Active' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
                           <span className="text-slate-400">{agent.status}</span>
                        </div>
                    </li>
                ))}
             </ul>
        </DashboardCard>
      </div>
      
      {/* Right Column - People & Talent */}
      <div className="lg:col-span-1 space-y-6 flex flex-col">
         <DashboardCard titleKey="digitalTwinSnapshots" className="flex-grow" onClick={() => handleOpenKpiModal('leadership')} glowing>
            {currentTwin ? (
                <div className="h-full flex flex-col justify-between animate-fade-in">
                    <div>
                        <p className="text-lg font-bold text-white">{currentTwin.name[language]}</p>
                        <p className="text-sm text-cyan-400">{currentTwin.currentRole[language]}</p>
                    </div>
                    <div className="space-y-3">
                        <div className="text-xs">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-slate-400">{t('readiness')}</span>
                                <span className="font-bold text-white">{currentTwin.digitalTwin.readiness.score}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full" style={{width: `${currentTwin.digitalTwin.readiness.score}%`}}></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-center">
                            <div><p className="text-slate-400">{t('engagementTrend')}</p><p className="font-bold text-white">{t(currentTwin.digitalTwin.engagementTrend as any)}</p></div>
                            <div><p className="text-slate-400">{t('sentiment')}</p><p className="font-bold text-white">{t(currentTwin.digitalTwin.sentiment.toLowerCase() as any)}</p></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">{isLoading ? t('analyzing')+'...' : 'No high-potentials found.'}</div>
            )}
        </DashboardCard>
        <DashboardCard titleKey="businessSimulationEngine" className="flex flex-col justify-center items-center text-center">
            <p className="text-slate-400 mb-4 text-sm">{t('simulationDesc')}</p>
            <button 
              onClick={() => setCurrentPage('simulation')}
              className="bg-cyan-600/50 hover:bg-cyan-600/80 text-white font-bold py-2 px-6 rounded-md transition-all duration-300"
            >
              {t('launchEngine')}
            </button>
        </DashboardCard>
      </div>
    </div>
    <KpiDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t(modalContent.titleKey as any)}
        data={modalContent.data}
        aiAnalysis={modalContent.analysis}
        isLoadingAi={isAnalyzingKpi}
      />
    </>
  );
};

export default Dashboard;