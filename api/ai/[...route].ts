import chat from '../_controllers/ai/chat';
import usage from '../_controllers/ai/usage';
import simulation from '../_controllers/ai/simulation';
import careerPath from '../_controllers/ai/career-path';
import skillGap from '../_controllers/ai/skill-gap';
import analyzePerformance from '../_controllers/ai/analyze-performance';
import analyzeDocument from '../_controllers/ai/analyze-document';
import policyQa from '../_controllers/ai/policy-qa';

export default async function handler(req: any, res: any) {
    const { route } = req.query;
    const path = Array.isArray(route) ? route[0] : route;

    switch (path) {
        case 'chat':
            return chat(req, res);
        case 'usage':
            return usage(req, res);
        case 'simulation':
            return simulation(req, res);
        case 'career-path':
            return careerPath(req, res);
        case 'skill-gap':
            return skillGap(req, res);
        case 'analyze-performance':
            return analyzePerformance(req, res);
        case 'analyze-document':
            return analyzeDocument(req, res);
        case 'policy-qa':
            return policyQa(req, res);
        default:
            return res.status(404).json({ error: 'AI route not found' });
    }
}
