import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS_URL = process.env.SUPABASE_JWT_JWKS_URL;
let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

if (JWKS_URL) {
    try {
        JWKS = createRemoteJWKSet(new URL(JWKS_URL));
    } catch (error) {
        console.error('❌ Failed to initialize JWKS:', error);
    }
}

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
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

        // Supabase JWTs usually have 'sub' as UID and 'role' in app_metadata
        req.userId = payload.sub;
        req.userRole = (payload.app_metadata as any)?.role || 'EMPLOYEE';

        next();
    } catch (error) {
        console.error('❌ Auth error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
}

export function requireRole(allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}
