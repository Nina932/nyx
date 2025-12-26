import prisma from '../_utils/prisma';
import { verifyAuth } from '../_utils/auth';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = await verifyAuth(req);

        const usage = await prisma.aiUsage.findMany({
            where: { userId: String(userId) },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        res.json(usage);
    } catch (error: any) {
        console.error('Usage API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
