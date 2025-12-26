import { GoogleGenAI, Type } from '@google/genai';
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
        const { scenarioPrompt, choicePrompt } = req.body;

        const prompt = `
      You are a business simulation engine. The user is in a scenario and has made a decision.
      Current Scenario: ${scenarioPrompt}
      User's Decision: ${choicePrompt}

      Based on the decision, provide a realistic "outcome" of their action.
      Then, create a "newSituation" that results from this outcome.
      Finally, provide two distinct "newChoices" for the user to make in this new situation.

      Return ONLY a JSON object.
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        outcome: { type: Type.STRING },
                        newSituation: { type: Type.STRING },
                        newChoices: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    textKey: { type: Type.STRING },
                                    prompt: {
                                        type: Type.OBJECT,
                                        properties: {
                                            en: { type: Type.STRING },
                                            ka: { type: Type.STRING },
                                        },
                                        required: ['en', 'ka'],
                                    },
                                },
                                required: ['textKey', 'prompt'],
                            },
                        },
                    },
                    required: ['outcome', 'newSituation', 'newChoices'],
                },
            },
        });

        if (userId) {
            await trackUsage(String(userId), 'simulation', prompt.length);
        }

        const responseText = response.text || '{}';
        res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
        console.error('Simulation API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
