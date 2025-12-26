import prisma from '../../../_utils/prisma';
import { verifyAuth } from '../../../_utils/auth';

function transformPolicy(policy: any) {
    return {
        id: policy.id,
        title: { en: policy.titleEn, ka: policy.titleKa },
        content: { en: policy.contentEn, ka: policy.contentKa },
    };
}

export default async function handler(req: any, res: any) {
    try {
        await verifyAuth(req);

        if (req.method === 'GET') {
            const policies = await prisma.policy.findMany({
                orderBy: { id: 'asc' },
            });
            return res.json(policies.map(transformPolicy));
        }

        if (req.method === 'POST') {
            const { title, content } = req.body;
            const policy = await prisma.policy.create({
                data: {
                    titleEn: title?.en || '',
                    titleKa: title?.ka || '',
                    contentEn: content?.en || '',
                    contentKa: content?.ka || '',
                },
            });
            return res.status(201).json(transformPolicy(policy));
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Policies API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
