import type { Employee, JobRole, HrMetricsData } from '../types';


const getHeaders = () => {
    const token = localStorage.getItem('supabase.auth.token'); // Adjust based on where token is stored
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

// Employee Service
export const getEmployees = async (): Promise<Employee[]> => {
    const res = await fetch('/api/employees', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
};

// Job Role Service
export const getJobRoles = async (): Promise<JobRole[]> => {
    const res = await fetch('/api/roles', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch roles');
    return res.json();
};

export const addJobRole = async (roleData: { title: { en: string; ka: string; }, requiredSkills: string[] }): Promise<JobRole> => {
    const res = await fetch('/api/roles', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(roleData),
    });
    if (!res.ok) throw new Error('Failed to create role');
    return res.json();
};

export const updateJobRole = async (role: JobRole): Promise<JobRole> => {
    const res = await fetch(`/api/roles/${role.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(role),
    });
    if (!res.ok) throw new Error('Failed to update role');
    return res.json();
};

export const deleteJobRole = async (id: number): Promise<{ id: number }> => {
    const res = await fetch(`/api/roles/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete role');
    return { id };
};

// HR Metrics Service
export const getHrMetrics = async (): Promise<HrMetricsData> => {
    // This could be its own endpoint or part of dashboard
    // For now, let's keep it mock or point to a new endpoint if available
    const res = await fetch('/api/ai/usage', { headers: getHeaders() }); // Just an example
    if (!res.ok) {
        // Fallback to mock for UI demonstration if metrics endpoint isn't ready
        return {
            summary: {
                turnoverRate: { value: 12, unit: '%' },
                engagementScore: { value: 4.2, unit: '/ 5' },
                onboardingCost: { value: '₾4,500' },
                trainingSpend: { value: '₾120,000' },
            },
            breakdown: {
                trainingHoursByDept: [
                    { dept: 'Engineering', hours: 68 },
                    { dept: 'Product', hours: 45 },
                    { dept: 'Sales', hours: 32 },
                    { dept: 'Marketing', hours: 25 },
                ]
            }
        };
    }
    // Transform usage to metrics if needed, or just return mock for now
    return {
        summary: {
            turnoverRate: { value: 12, unit: '%' },
            engagementScore: { value: 4.2, unit: '/ 5' },
            onboardingCost: { value: '₾4,500' },
            trainingSpend: { value: '₾120,000' },
        },
        breakdown: {
            trainingHoursByDept: [
                { dept: 'Engineering', hours: 68 },
                { dept: 'Product', hours: 45 },
                { dept: 'Sales', hours: 32 },
                { dept: 'Marketing', hours: 25 },
            ]
        }
    };
};