import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PrismaClient } from '.prisma/client';

const prisma = new PrismaClient();
const JWKS_URL = process.env.SUPABASE_JWT_JWKS_URL;
let JWKS: any = null;

if (JWKS_URL) {
    JWKS = createRemoteJWKSet(new URL(JWKS_URL));
}

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

        if (!JWKS) {
            console.error('❌ JWKS not configured');
            return res.status(500).json({ error: 'Authentication service misconfigured' });
        }

        const { payload } = await jwtVerify(token, JWKS);
        const userId = payload.sub;

        const user = await prisma.user.findUnique({
            where: { id: String(userId) },
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
