import prisma from '../../../_utils/prisma';
import { verifyAuth } from '../../../_utils/auth';

function transformRole(role: any) {
    return {
        id: role.id,
        title: { en: role.titleEn, ka: role.titleKa },
        requiredSkills: role.requiredSkills || [],
    };
}

export default async function handler(req: any, res: any, queryId?: string) {
    const idParam = queryId || req.query.id;
    const id = parseInt(idParam as string);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid role ID' });
    }

    try {
        await verifyAuth(req);

        if (req.method === 'GET') {
            const role = await prisma.jobRole.findUnique({ where: { id } });
            if (!role) return res.status(404).json({ error: 'Role not found' });
            return res.json(transformRole(role));
        }

        if (req.method === 'PUT') {
            const { title, requiredSkills } = req.body;
            const role = await prisma.jobRole.update({
                where: { id },
                data: {
                    titleEn: title?.en,
                    titleKa: title?.ka,
                    requiredSkills: requiredSkills || undefined,
                },
            });
            return res.json(transformRole(role));
        }

        if (req.method === 'DELETE') {
            await prisma.jobRole.delete({ where: { id } });
            return res.json({ id });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Role Detail API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
