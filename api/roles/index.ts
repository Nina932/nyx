import prisma from '../_utils/prisma';
import { verifyAuth } from '../_utils/auth';

function transformRole(role: any) {
    return {
        id: role.id,
        title: { en: role.titleEn, ka: role.titleKa },
        requiredSkills: role.requiredSkills || [],
    };
}

export default async function handler(req: any, res: any) {
    try {
        await verifyAuth(req);

        if (req.method === 'GET') {
            const roles = await prisma.jobRole.findMany({
                orderBy: { id: 'asc' },
            });
            return res.json(roles.map(transformRole));
        }

        if (req.method === 'POST') {
            const { title, requiredSkills } = req.body;
            const role = await prisma.jobRole.create({
                data: {
                    titleEn: title?.en || title || '',
                    titleKa: title?.ka || title || '',
                    requiredSkills: requiredSkills || [],
                },
            });
            return res.status(201).json(transformRole(role));
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Roles API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
