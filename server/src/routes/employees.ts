import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

// Helper to transform DB employee to frontend format
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

// Get all employees
router.get('/', async (_req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { id: 'asc' },
        });
        res.json(employees.map(transformEmployee));
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Get single employee
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const employee = await prisma.employee.findUnique({ where: { id } });

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(transformEmployee(employee));
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

// Create employee
router.post('/', async (req, res) => {
    try {
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
        res.status(201).json(transformEmployee(employee));
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;

        const employee = await prisma.employee.update({
            where: { id },
            data: {
                nameEn: data.name?.en,
                nameKa: data.name?.ka,
                currentRoleEn: data.currentRole?.en,
                currentRoleKa: data.currentRole?.ka,
                departmentEn: data.department?.en,
                departmentKa: data.department?.ka,
                skills: data.skills || undefined,
                performanceScore: data.performanceScore,
                grade: data.grade,
            },
        });

        res.json(transformEmployee(employee));
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.employee.delete({ where: { id } });
        res.json({ id });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

export { router as employeesRouter };
