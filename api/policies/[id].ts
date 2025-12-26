import prisma from '../_utils/prisma';
import { verifyAuth } from '../_utils/auth';

function transformPolicy(policy: any) {
    return {
        id: policy.id,
        title: { en: policy.titleEn, ka: policy.titleKa },
        content: { en: policy.contentEn, ka: policy.contentKa },
    };
}

export default async function handler(req: any, res: any) {
    const { id: idParam } = req.query;
    const id = parseInt(idParam as string);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid policy ID' });
    }

    try {
        await verifyAuth(req);

        if (req.method === 'GET') {
            const policy = await prisma.policy.findUnique({ where: { id } });
            if (!policy) return res.status(404).json({ error: 'Policy not found' });
            return res.json(transformPolicy(policy));
        }

        if (req.method === 'PUT') {
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
            return res.json(transformPolicy(policy));
        }

        if (req.method === 'DELETE') {
            await prisma.policy.delete({ where: { id } });
            return res.json({ id });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Policy Detail API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
