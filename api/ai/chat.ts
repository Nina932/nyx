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
        const { prompt, persona = 'general' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const personaConfig: Record<string, { model: string; systemInstruction: string }> = {
            general: {
                model: 'gemini-2.5-flash',
                systemInstruction: 'You are a helpful, general-purpose HR assistant for the NYX platform. Be concise and professional.',
            },
            strategist: {
                model: 'gemini-2.5-pro',
                systemInstruction: 'You are an expert HR Strategist. Provide insightful, high-level analysis and recommendations.',
            },
            data_analyst: {
                model: 'gemini-2.5-flash',
                systemInstruction: 'You are a meticulous Data Analyst. Focus on the numbers and facts.',
            },
        };

        const config = personaConfig[persona] || personaConfig.general;

        const response = await ai.models.generateContent({
            model: config.model,
            contents: prompt,
            config: { systemInstruction: config.systemInstruction },
        });

        if (userId) {
            await trackUsage(String(userId), 'chat', prompt.length);
        }

        res.json({ text: response.text });
    } catch (error: any) {
        console.error('Chat API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
