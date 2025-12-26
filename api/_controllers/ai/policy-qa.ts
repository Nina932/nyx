import { GoogleGenAI } from '@google/genai';
import prisma from '../../_utils/prisma';
import { verifyAuth } from '../../_utils/auth';

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
        const { policy, question } = req.body;

        const prompt = `
      You are an HR Compliance Agent. Answer the user's question based *only* on the provided company policy text. If the answer is not in the text, clearly state that the policy does not cover this topic.

      Policy Title: ${policy.title?.en || policy.titleEn}
      Policy Content:
      ---
      ${policy.content?.en || policy.contentEn}
      ---

      User Question: "${question}"

      Answer:
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        if (userId) {
            await trackUsage(String(userId), 'policy-qa', prompt.length);
        }

        res.json({ text: response.text });
    } catch (error: any) {
        console.error('Policy QA API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
