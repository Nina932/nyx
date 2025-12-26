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
        const { employee } = req.body;

        if (!employee) {
            return res.status(400).json({ error: 'Employee data is required' });
        }

        const prompt = `
      Analyze the following employee profile for a tech company in Tbilisi, Georgia and generate a personalized 2-step career progression path.

      Employee Profile:
      - Name: ${employee.name?.en || employee.nameEn}
      - Current Role: ${employee.currentRole?.en || employee.currentRoleEn}
      - Current Skills: ${Array.isArray(employee.skills) ? employee.skills.join(', ') : ''}
      - Performance Score: ${employee.performanceScore}/100
      - Stated Career Goals: ${Array.isArray(employee.careerGoals) ? employee.careerGoals.map((g: any) => g.en).join(', ') : ''}

      Based on this profile, suggest a realistic and ambitious career path. For each of the 2 steps, provide:
      1. A potential next role title.
      2. A brief, one-sentence description of that role's core responsibility.
      3. A list of 3 key skills they need to develop.
      4. A list of 2 recommended training courses or actions.

      Return ONLY the JSON object.
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        currentRole: { type: Type.STRING },
                        suggestedPath: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    role: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    skillsToDevelop: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    recommendedTraining: { type: Type.ARRAY, items: { type: Type.STRING } },
                                },
                                required: ['role', 'description', 'skillsToDevelop', 'recommendedTraining'],
                            },
                        },
                    },
                    required: ['currentRole', 'suggestedPath'],
                },
            },
        });

        if (userId) {
            await trackUsage(String(userId), 'career-path', prompt.length);
        }

        const responseText = response.text || '{}';
        res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
        console.error('Career Path API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
