import rateLimit from 'express-rate-limit';

// Rate limiter for AI endpoints: 10 requests per hour per user
export const aiRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: { error: 'AI rate limit exceeded. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: any) => {
        // Use user ID if authenticated, otherwise use IP
        return req.userId?.toString() || req.ip;
    },
    skip: (req: any) => {
        // Skip rate limiting for admin users
        return req.userRole === 'ADMIN';
    },
});

// General API rate limiter: 100 requests per 15 minutes
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
