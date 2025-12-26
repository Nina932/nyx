import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Employee, OrgChartNode as OrgChartNodeType } from '../types';
import { getEmployees } from '../services/api';
import { EmployeeFilter } from '../components/organization/EmployeeFilter';
import { EmployeeRoster } from '../components/organization/EmployeeRoster';
import OrgChartPage from './OrgChartPage';


const buildOrgChart = (employees: Employee[]): OrgChartNodeType => {
    // This is a simplified logic. A real implementation would use manager IDs.
    // For this mock, we'll create a simple hierarchy based on roles.
    if (employees.length === 0) {
        return { id: 0, name: { en: 'Root', ka: 'Root' }, role: { en: '', ka: '' }, reports: [] };
    }
    
    const hierarchy: Record<string, string | null> = {
        'CEO': null,
        'CTO': 'CEO',
        'Senior Product Manager': 'CEO',
        'Lead Software Engineer': 'CTO',
        'Software Engineer': 'Lead Software Engineer',
    };

    const nodes = new Map<number, OrgChartNodeType>();
    employees.forEach(emp => {
        // FIX: The map key must be a number (emp.id), not the entire employee object.
        nodes.set(emp.id, {
            id: emp.id,
            name: emp.name,
            role: emp.currentRole,
            avatarUrl: `/avatars/avatar_${emp.id}.png`,
            reports: []
        });
    });

    const rootNodes: OrgChartNodeType[] = [];
    nodes.forEach(node => {
        const employee = employees.find(e => e.id === node.id);
        if (employee) {
            const managerRole = hierarchy[employee.currentRole.en];
            if (managerRole) {
                const manager = employees.find(e => e.currentRole.en === managerRole);
                if (manager) {
                    const managerNode = nodes.get(manager.id);
                    if (managerNode) {
                        managerNode.reports?.push(node);
                    }
                } else {
                    rootNodes.push(node);
                }
            } else {
                rootNodes.push(node);
            }
        }
    });
    
    // Assuming one root (CEO) for simplicity
    const ceo = employees.find(e => e.currentRole.en === 'CEO');
    const root = ceo ? nodes.get(ceo.id) : rootNodes[0];

    return root || { id: 0, name: { en: 'Root', ka: 'Root' }, role: { en: '', ka: '' }, reports: [] };
};

interface OrganizationPageProps {
    onViewEmployee: (employee: Employee) => void;
}

export const OrganizationPage: React.FC<OrganizationPageProps> = ({ onViewEmployee }) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'roster' | 'chart'>('roster');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        searchTerm: '',
        hireDate: '',
        performanceRange: [0, 100] as [number, number],
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            try {
                const data = await getEmployees();
                setEmployees(data);
            } catch (error) {
                console.error("Failed to fetch employees:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    // FIX: Add the component body, including filtering logic and a JSX return statement to resolve the error.
    const filteredEmployees = useMemo(() => {
        return employees
            .filter(emp => 
                `${emp.name.en} ${emp.name.ka} ${emp.currentRole.en} ${emp.currentRole.ka} ${emp.department.en} ${emp.department.ka}`
                .toLowerCase().includes(filters.searchTerm.toLowerCase())
            )
            .filter(emp => filters.hireDate ? emp.hireDate >= filters.hireDate : true)
            .filter(emp => emp.performanceScore >= filters.performanceRange[0] && emp.performanceScore <= filters.performanceRange[1]);
    }, [employees, filters]);
    
    const orgChartData = useMemo(() => buildOrgChart(employees), [employees]);

    const handleViewEmployeeFromChart = (employeeId: number) => {
        const employee = employees.find(e => e.id === employeeId);
        if (employee) {
            onViewEmployee(employee);
        }
    };

    const TabButton: React.FC<{ tabName: 'roster' | 'chart'; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setView(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors ${
                view === tabName
                    ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-300'
                    : 'text-slate-400 hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('page_organization')}</h2>
            <div className="border-b border-cyan-400/20 flex space-x-4">
                <TabButton tabName="roster" label={t('sub_roster')} />
                <TabButton tabName="chart" label={t('sub_orgChart')} />
            </div>

            {isLoading ? (
                 <div className="flex items-center justify-center h-64">
                    <div className="text-center text-slate-400 text-sm">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-200"></div>
                            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-400"></div>
                        </div>
                        <p className="mt-2">{t('analyzing')}...</p>
                    </div>
                </div>
            ) : view === 'roster' ? (
                <div className="space-y-6">
                    <EmployeeFilter filters={filters} setFilters={setFilters} />
                    <EmployeeRoster employees={filteredEmployees} onViewEmployee={onViewEmployee} />
                </div>
            ) : (
                <OrgChartPage orgData={orgChartData} onNodeClick={handleViewEmployeeFromChart} />
            )}
        </div>
    );
};
