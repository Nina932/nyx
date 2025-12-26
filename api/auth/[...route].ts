import me from '../_controllers/auth/me';

export default async function handler(req: any, res: any) {
    const { route } = req.query;
    const path = Array.isArray(route) ? route[0] : route;

    switch (path) {
        case 'me':
            return me(req, res);
        default:
            return res.status(404).json({ error: 'Auth route not found' });
    }
}
