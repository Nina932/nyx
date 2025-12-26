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
        const { employees, roles } = req.body;

        if (!employees || !roles) {
            return res.status(400).json({ error: 'Employees and roles data required' });
        }

        const prompt = `
      Analyze the provided list of employees and their skills against the job role requirements.

      Job Roles and Required Skills:
      ${roles.map((r: any) => `- ${r.titleEn || r.title?.en}: ${Array.isArray(r.requiredSkills) ? r.requiredSkills.join(', ') : ''}`).join('\n')}

      Employees and Their Current Skills:
      ${employees.map((e: any) => `- ${e.nameEn || e.name?.en} (${e.currentRoleEn || e.currentRole?.en}): ${Array.isArray(e.skills) ? e.skills.join(', ') : ''}`).join('\n')}

      Identify the top 3 most critical skill gaps.

      Return ONLY the JSON array.
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            skill: { type: Type.STRING },
                            gapCount: { type: Type.INTEGER },
                            importance: { type: Type.STRING },
                            recommendedTraining: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['skill', 'gapCount', 'importance', 'recommendedTraining'],
                    },
                },
            },
        });

        if (userId) {
            await trackUsage(String(userId), 'skill-gap', prompt.length);
        }

        const responseText = response.text || '[]';
        res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
        console.error('Skill Gap API error:', error);
        res.status(error.message === 'No token provided' ? 401 : 500).json({ error: error.message });
    }
}
