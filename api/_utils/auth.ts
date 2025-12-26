import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS_URL = process.env.SUPABASE_JWT_JWKS_URL;
let JWKS: any = null;

if (JWKS_URL) {
    try {
        JWKS = createRemoteJWKSet(new URL(JWKS_URL));
    } catch (error) {
        console.error('❌ Failed to initialize JWKS:', error);
    }
}

export async function verifyAuth(req: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!JWKS) {
        throw new Error('Authentication service misconfigured');
    }

    const { payload } = await jwtVerify(token, JWKS);
    return {
        userId: payload.sub,
        role: (payload.app_metadata as any)?.role || 'EMPLOYEE',
    };
}
