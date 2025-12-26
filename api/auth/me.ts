import jwt from 'jsonwebtoken';
import { PrismaClient } from '.prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string | number; role: string };

        const user = await prisma.user.findUnique({
            where: { id: String(decoded.userId) },
            select: { id: true, email: true, role: true, createdAt: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
}
