import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PrismaClient } from '.prisma/client';

const prisma = new PrismaClient();
const JWKS_URL = process.env.SUPABASE_JWT_JWKS_URL;
let JWKS: any = null;

if (JWKS_URL) {
    JWKS = createRemoteJWKSet(new URL(JWKS_URL));
}

async function getUserFromToken(authHeader: string | undefined) {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];

    if (!JWKS) return null;

    try {
        const { payload } = await jwtVerify(token, JWKS);
        return { userId: payload.sub, role: (payload.app_metadata as any)?.role || 'EMPLOYEE' };
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
    const user = await getUserFromToken(req.headers.authorization);
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
