import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

function getUserFromToken(authHeader: string | undefined) {
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split(' ')[1];
        return jwt.verify(token, JWT_SECRET) as { userId: string | number; role: string };
    } catch {
        return null;
    }
}

export default async function handler(req: any, res: any) {
    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Auth check
    const user = getUserFromToken(req.headers.authorization);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const usage = await prisma.aiUsage.findMany({
            where: { userId: String(user.userId) },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.json(usage);
    } catch (error) {
        console.error('Usage fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch usage' });
    }
}
