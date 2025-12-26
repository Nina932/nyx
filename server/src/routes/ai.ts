import { Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimit.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Middleware for all AI routes
router.use(requireAuth);
router.use(aiRateLimiter);

// Track AI usage
async function trackUsage(userId: number, endpoint: string, tokens: number = 0) {
    await prisma.aiUsage.create({
        data: { userId, endpoint, tokens, cost: tokens * 0.000001 }, // Placeholder cost
    });
}

// ============================================
// Chat Endpoint
// ============================================
router.post('/chat', async (req: AuthRequest, res) => {
    try {
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

        await trackUsage(req.userId!, 'chat', prompt.length);

        res.json({ text: response.text });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

// ============================================
// Career Path Endpoint
// ============================================
router.post('/career-path', async (req: AuthRequest, res) => {
    try {
        const { employee } = req.body;

        if (!employee) {
            return res.status(400).json({ error: 'Employee data is required' });
        }

        const prompt = `
      Analyze the following employee profile for a tech company in Tbilisi, Georgia and generate a personalized 2-step career progression path.

      Employee Profile:
      - Name: ${employee.name?.en || employee.nameEn}
      - Current Role: ${employee.currentRole?.en || employee.currentRoleEn}
      - Current Skills: ${Array.isArray(employee.skills) ? employee.skills.join(', ') : JSON.parse(employee.skills || '[]').join(', ')}
      - Performance Score: ${employee.performanceScore}/100
      - Stated Career Goals: ${Array.isArray(employee.careerGoals) ? employee.careerGoals.map((g: any) => g.en || g).join(', ') : JSON.parse(employee.careerGoalsEn || '[]').join(', ')}

      Based on this profile, suggest a realistic and ambitious career path. For each of the 2 steps, provide:
      1. A potential next role title.
      2. A brief, one-sentence description of that role's core responsibility.
      3. A list of 3 key skills they need to develop.
      4. A list of 2 recommended training courses or actions.

      Return ONLY the JSON object. The path should start from their current role.
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

        await trackUsage(req.userId!, 'career-path', prompt.length);

        res.json(JSON.parse(response.text.trim()));
    } catch (error) {
        console.error('Career path error:', error);
        res.status(500).json({ error: 'Failed to generate career path' });
    }
});

// ============================================
// Skill Gap Analysis Endpoint
// ============================================
router.post('/skill-gap', async (req: AuthRequest, res) => {
    try {
        const { employees, roles } = req.body;

        if (!employees || !roles) {
            return res.status(400).json({ error: 'Employees and roles data required' });
        }

        const prompt = `
      Analyze the provided list of employees and their skills against the job role requirements.

      Job Roles and Required Skills:
      ${roles.map((r: any) => `- ${r.title?.en || r.titleEn}: ${Array.isArray(r.requiredSkills) ? r.requiredSkills.join(', ') : JSON.parse(r.requiredSkills || '[]').join(', ')}`).join('\n')}

      Employees and Their Current Skills:
      ${employees.map((e: any) => `- ${e.name?.en || e.nameEn} (${e.currentRole?.en || e.currentRoleEn}): ${Array.isArray(e.skills) ? e.skills.join(', ') : JSON.parse(e.skills || '[]').join(', ')}`).join('\n')}

      Identify the top 3 most critical skill gaps. For each, provide:
      1. The name of the skill.
      2. The total number of employees who have this gap.
      3. An importance level ('High', 'Medium', or 'Low').
      4. A list of 1-2 recommended training programs.

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

        await trackUsage(req.userId!, 'skill-gap', prompt.length);

        res.json(JSON.parse(response.text.trim()));
    } catch (error) {
        console.error('Skill gap error:', error);
        res.status(500).json({ error: 'Failed to analyze skill gaps' });
    }
});

// ============================================
// Performance Analysis Endpoint
// ============================================
router.post('/analyze-performance', async (req: AuthRequest, res) => {
    try {
        const { employeeName, performanceData, feedback } = req.body;

        const prompt = `
      Analyze the last 3 months of performance data and recent feedback for an employee named ${employeeName}.
      
      Performance Data (1-10 scale): ${JSON.stringify(performanceData)}
      - Engagement: How motivated and involved they are.
      - Productivity: How much work they are completing.
      - Wellbeing: Self-reported well-being, lower is worse.

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

        await trackUsage(req.userId!, 'analyze-performance', prompt.length);

        res.json(JSON.parse(response.text.trim()));
    } catch (error) {
        console.error('Performance analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze performance' });
    }
});

// ============================================
// Business Simulation Endpoint
// ============================================
router.post('/simulation', async (req: AuthRequest, res) => {
    try {
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

        await trackUsage(req.userId!, 'simulation', prompt.length);

        res.json(JSON.parse(response.text.trim()));
    } catch (error) {
        console.error('Simulation error:', error);
        res.status(500).json({ error: 'Failed to run simulation' });
    }
});

// ============================================
// Document Analysis Endpoint
// ============================================
router.post('/analyze-document', async (req: AuthRequest, res) => {
    try {
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

        await trackUsage(req.userId!, 'analyze-document', prompt.length);

        res.json({ text: response.text });
    } catch (error) {
        console.error('Document analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze document' });
    }
});

// ============================================
// Policy Q&A Endpoint
// ============================================
router.post('/policy-qa', async (req: AuthRequest, res) => {
    try {
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

        await trackUsage(req.userId!, 'policy-qa', prompt.length);

        res.json({ text: response.text });
    } catch (error) {
        console.error('Policy QA error:', error);
        res.status(500).json({ error: 'Failed to answer policy question' });
    }
});

// Usage stats endpoint (for admin dashboard)
router.get('/usage', async (req: AuthRequest, res) => {
    try {
        const usage = await prisma.aiUsage.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.json(usage);
    } catch (error) {
        console.error('Usage fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch usage' });
    }
});

export { router as aiRouter };
