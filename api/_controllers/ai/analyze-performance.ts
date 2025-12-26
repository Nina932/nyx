import { GoogleGenAI, Type } from '@google/genai';
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
        const { employeeName, performanceData, feedback } = req.body;

        const prompt = `
      Analyze the last 3 months of performance data and recent feedback for an employee named ${employeeName}.
      
      Performance Data (1-10 scale): ${JSON.stringify(performanceData)}
      Recent Manager Feedback: "${feedback}"

      Based on ALL this data, provide a concise analysis:
      1. Sentiment Analysis: Provide a sentiment 'score' from -1 to 1 and a 'label' ('Positive', 'Neutral', 'Negative').
      2. Burnout Risk: ('Low', 'Medium', 'High').
      3. Performance Trend: ('Improving', 'Stable', 'Declining').
      4. Recommendations: Provide two actionable recommendations.

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
                        sentiment: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.NUMBER },
                                label: { type: Type.STRING },
                            },
                            required: ['score', 'label'],
                        },
                        burnoutRisk: { type: Type.STRING },
                        trend: { type: Type.STRING },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['sentiment', 'burnoutRisk', 'trend', 'recommendations'],
                },
            },
        });

        if (userId) {
            await trackUsage(String(userId), 'analyze-performance', prompt.length);
        }

        const responseText = response.text || '{}';
        res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
        console.error('Performance Analysis API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
