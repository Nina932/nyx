import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

// Helper to transform DB role to frontend format
function transformRole(role: any) {
    return {
        id: role.id,
        title: { en: role.titleEn, ka: role.titleKa },
        requiredSkills: role.requiredSkills || [],
    };
}

// Get all roles
router.get('/', async (_req, res) => {
    try {
        const roles = await prisma.jobRole.findMany({
            orderBy: { id: 'asc' },
        });
        res.json(roles.map(transformRole));
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

// Get single role
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const role = await prisma.jobRole.findUnique({ where: { id } });

        if (!role) {
            return res.status(404).json({ error: 'Role not found' });
        }

        res.json(transformRole(role));
    } catch (error) {
        console.error('Get role error:', error);
        res.status(500).json({ error: 'Failed to fetch role' });
    }
});

// Create role
router.post('/', async (req, res) => {
    try {
        const { title, requiredSkills } = req.body;
        const role = await prisma.jobRole.create({
            data: {
                titleEn: title?.en || title || '',
                titleKa: title?.ka || title || '',
                requiredSkills: requiredSkills || [],
            },
        });
        res.status(201).json(transformRole(role));
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({ error: 'Failed to create role' });
    }
});

// Update role
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, requiredSkills } = req.body;

        const role = await prisma.jobRole.update({
            where: { id },
            data: {
                titleEn: title?.en,
                titleKa: title?.ka,
                requiredSkills: requiredSkills || undefined,
            },
        });

        res.json(transformRole(role));
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// Delete role
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.jobRole.delete({ where: { id } });
        res.json({ id });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({ error: 'Failed to delete role' });
    }
});

export { router as rolesRouter };
