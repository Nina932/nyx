import { GoogleGenAI } from '@google/genai';
import prisma from '../_utils/prisma';
import { verifyAuth } from '../_utils/auth';

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });

async function trackUsage(userId: string, endpoint: string, tokens: number = 0) {
    await prisma.aiUsage.create({
        data: { userId, endpoint, tokens, cost: tokens * 0.000001 },
    });
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = await verifyAuth(req);
        const { text, task } = req.body;

        const complianceRules = `
      1. The agreement must specify a probation period no longer than 6 months.
      2. Annual leave must be at least 24 working days.
      3. Termination requires at least 30 days' notice from the employer.
      4. Overtime must be compensated at a rate of at least 125% of the normal hourly wage.
    `;

        const prompt = task === 'summarize'
            ? `Summarize the key points of the following document in a few bullet points:\n\n${text}`
            : `Analyze the following labor agreement text and check if it complies with these rules. For each rule, state if it is "Compliant", "Non-Compliant", or "Not Mentioned".\n\nRules:\n${complianceRules}\n\nDocument Text:\n${text}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        if (userId) {
            await trackUsage(String(userId), 'analyze-document', prompt.length);
        }

        res.json({ text: response.text });
    } catch (error: any) {
        console.error('Document Analysis API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
