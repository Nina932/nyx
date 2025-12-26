import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

// Helper to transform DB policy to frontend format
function transformPolicy(policy: any) {
    return {
        id: policy.id,
        title: { en: policy.titleEn, ka: policy.titleKa },
        content: { en: policy.contentEn, ka: policy.contentKa },
    };
}

// Get all policies
router.get('/', async (_req, res) => {
    try {
        const policies = await prisma.policy.findMany({
            orderBy: { id: 'asc' },
        });
        res.json(policies.map(transformPolicy));
    } catch (error) {
        console.error('Get policies error:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
});

// Get single policy
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const policy = await prisma.policy.findUnique({ where: { id } });

        if (!policy) {
            return res.status(404).json({ error: 'Policy not found' });
        }

        res.json(transformPolicy(policy));
    } catch (error) {
        console.error('Get policy error:', error);
        res.status(500).json({ error: 'Failed to fetch policy' });
    }
});

// Create policy
router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;
        const policy = await prisma.policy.create({
            data: {
                titleEn: title?.en || '',
                titleKa: title?.ka || '',
                contentEn: content?.en || '',
                contentKa: content?.ka || '',
            },
        });
        res.status(201).json(transformPolicy(policy));
    } catch (error) {
        console.error('Create policy error:', error);
        res.status(500).json({ error: 'Failed to create policy' });
    }
});

// Update policy
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, content } = req.body;

        const policy = await prisma.policy.update({
            where: { id },
            data: {
                titleEn: title?.en,
                titleKa: title?.ka,
                contentEn: content?.en,
                contentKa: content?.ka,
            },
        });

        res.json(transformPolicy(policy));
    } catch (error) {
        console.error('Update policy error:', error);
        res.status(500).json({ error: 'Failed to update policy' });
    }
});

// Delete policy
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.policy.delete({ where: { id } });
        res.json({ id });
    } catch (error) {
        console.error('Delete policy error:', error);
        res.status(500).json({ error: 'Failed to delete policy' });
    }
});

export { router as policiesRouter };
