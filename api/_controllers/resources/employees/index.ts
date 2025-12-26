import prisma from '../../../_utils/prisma';
import { verifyAuth } from '../../../_utils/auth';

function transformEmployee(emp: any) {
    return {
        id: emp.id,
        name: { en: emp.nameEn, ka: emp.nameKa },
        currentRole: { en: emp.currentRoleEn, ka: emp.currentRoleKa },
        department: { en: emp.departmentEn, ka: emp.departmentKa },
        hireDate: emp.hireDate.toISOString().split('T')[0],
        education: { en: emp.educationEn, ka: emp.educationKa },
        skills: emp.skills || [],
        performanceScore: emp.performanceScore,
        grade: emp.grade,
        careerGoals: (emp.careerGoalsEn as string[] || []).map((goal: string, i: number) => ({
            en: goal,
            ka: (emp.careerGoalsKa as string[] || [])[i] || goal,
        })),
        performanceData: emp.performanceData || [],
        feedback: { en: emp.feedbackEn, ka: emp.feedbackKa },
        digitalTwin: emp.digitalTwin || {},
    };
}

export default async function handler(req: any, res: any) {
    try {
        await verifyAuth(req);

        if (req.method === 'GET') {
            const employees = await prisma.employee.findMany({
                orderBy: { id: 'asc' },
            });
            return res.json(employees.map(transformEmployee));
        }

        if (req.method === 'POST') {
            const data = req.body;
            const employee = await prisma.employee.create({
                data: {
                    nameEn: data.name?.en || data.nameEn,
                    nameKa: data.name?.ka || data.nameKa,
                    currentRoleEn: data.currentRole?.en || data.currentRoleEn,
                    currentRoleKa: data.currentRole?.ka || data.currentRoleKa,
                    departmentEn: data.department?.en || data.departmentEn,
                    departmentKa: data.department?.ka || data.departmentKa,
                    hireDate: new Date(data.hireDate),
                    educationEn: data.education?.en || data.educationEn,
                    educationKa: data.education?.ka || data.educationKa,
                    skills: data.skills || [],
                    performanceScore: data.performanceScore || 0,
                    grade: data.grade || 'C',
                    careerGoalsEn: data.careerGoals?.map((g: any) => g.en) || [],
                    careerGoalsKa: data.careerGoals?.map((g: any) => g.ka) || [],
                    performanceData: data.performanceData || [],
                    feedbackEn: data.feedback?.en || '',
                    feedbackKa: data.feedback?.ka || '',
                    digitalTwin: data.digitalTwin || {},
                },
            });
            return res.status(201).json(transformEmployee(employee));
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Employees API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
