
import type { GroundingChunk, Employee, CareerPath, JobRole, SkillGap, PerformanceData, Policy, TrainingCourse, SimulationStepResult, DataQueryResult, AiAction } from '../types';

const getHeaders = () => {
    const token = localStorage.getItem('supabase.auth.token'); // Consistency with api.ts
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export type Persona = 'general' | 'strategist' | 'data_analyst';

export const getChatResponse = async (prompt: string, persona: Persona = 'general'): Promise<string> => {
    try {
        const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ prompt, persona }),
        });
        if (!res.ok) throw new Error('Failed to get AI response');
        const data = await res.json();
        return data.text;
    } catch (error) {
        console.error("Error in getChatResponse:", error);
        return "Sorry, I encountered an error. Please check the console for details.";
    }
};

// Note: getThinkingResponse is currently mapped to general chat or needs dedicated route
// Since we didn't create a dedicated 'thinking' route, we'll use chat with pro model if persona allows
export const getThinkingResponse = async (prompt: string): Promise<string> => {
    return getChatResponse(prompt, 'strategist');
};

interface GroundedResponse {
    text: string;
    grounding: GroundingChunk[];
}

export const getSearchGroundedResponse = async (prompt: string): Promise<GroundedResponse> => {
    // Current serverless implementation doesn't support tools yet, but we'll point to chat for now
    // or keep it local if strictly necessary, but better to move all to server
    try {
        const text = await getChatResponse(prompt, 'general');
        return { text, grounding: [] };
    } catch (error) {
        console.error("Error in getSearchGroundedResponse:", error);
        return { text: "Sorry, I couldn't search for that.", grounding: [] };
    }
};

export const getMapsGroundedResponse = async (prompt: string): Promise<GroundedResponse> => {
    try {
        const text = await getChatResponse(prompt, 'general');
        return { text, grounding: [] };
    } catch (error) {
        console.error("Error in getMapsGroundedResponse:", error);
        return { text: "Sorry, I couldn't find that on the map.", grounding: [] };
    }
};

export const getCareerPath = async (employee: Employee): Promise<CareerPath> => {
    const res = await fetch('/api/ai/career-path', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ employee }),
    });
    if (!res.ok) throw new Error("Failed to generate career path.");
    return res.json();
};

export const getSkillGapAnalysis = async (employees: Employee[], roles: JobRole[]): Promise<SkillGap[]> => {
    const res = await fetch('/api/ai/skill-gap', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ employees, roles }),
    });
    if (!res.ok) throw new Error("Failed to generate skill gap analysis.");
    return res.json();
};

export const suggestSkillsForRole = async (roleTitle: string): Promise<string[]> => {
    // Reusing chat or dedicated endpoint if created (did we?)
    // Let's use chat for now as a fallback if no dedicated route was made
    const prompt = `Suggest 5-7 essential skills for: ${roleTitle}. Return ONLY a JSON array of strings.`;
    const text = await getChatResponse(prompt, 'general');
    try {
        return JSON.parse(text);
    } catch {
        return ["Leadership", "Communication", "Problem Solving"]; // Fallback
    }
};

export const analyzePerformance = async (employeeName: string, performanceData: PerformanceData[], feedback: string) => {
    const res = await fetch('/api/ai/analyze-performance', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ employeeName, performanceData, feedback }),
    });
    if (!res.ok) throw new Error("Failed to analyze performance data.");
    return res.json();
};

export const analyzeDocument = async (text: string, task: 'summarize' | 'comply'): Promise<string> => {
    const res = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text, task }),
    });
    if (!res.ok) return "Failed to analyze the document.";
    const data = await res.json();
    return data.text;
};

export const answerPolicyQuestion = async (policy: Policy, question: string): Promise<string> => {
    const res = await fetch('/api/ai/policy-qa', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ policy, question }),
    });
    if (!res.ok) return "Failed to get an answer from the policy.";
    const data = await res.json();
    return data.text;
};

export const suggestTrainingPrograms = async (skill: string): Promise<Omit<TrainingCourse, 'id'>[]> => {
    // Fallback to chat for suggestions if no dedicated endpoint
    const prompt = `Suggest 3 training courses for skill "${skill}". Return JSON: { "suggestions": [{"title": "...", "provider": "...", "duration": "..."}] }`;
    const text = await getChatResponse(prompt, 'general');
    try {
        const parsed = JSON.parse(text);
        return parsed.suggestions;
    } catch {
        return [];
    }
};

export const analyzeRevenueTrend = async (): Promise<string> => {
    return getChatResponse("Analyze revenue trend for Jan-Jul: 2400, 2210, 2290, 2000, 2181, 2500, 2100. One sentence summary.");
};

export const runBusinessSimulation = async (scenarioPrompt: string, choicePrompt: string): Promise<SimulationStepResult> => {
    const res = await fetch('/api/ai/simulation', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ scenarioPrompt, choicePrompt }),
    });
    if (!res.ok) throw new Error("Failed to run simulation step.");
    return res.json();
};

export const extractInfoFromDoc = async (docText: string, docType: 'cv' | 'contract'): Promise<any> => {
    // Using analyze-document task for extraction if persona or task allows
    // For now, let's keep it consistent
    return {}; // Placeholder if not fully implemented in serverless
};

export const processDataQuery = async (query: string): Promise<DataQueryResult> => {
    // Reusing chat for data query processing
    const prompt = `Simulate BI analysis for: ${query}. Return JSON with "plan", "result" (array), "validationError".`;
    const text = await getChatResponse(prompt, 'data_analyst');
    try {
        return JSON.parse(text);
    } catch {
        return { plan: "Failed to process", result: [] };
    }
};

export const getGapClosureRecommendations = async (gaps: SkillGap[]): Promise<{ recommendations: string; proposedAction: AiAction; }> => {
    const prompt = `Analyze gaps and provide recommendations/action. Gaps: ${JSON.stringify(gaps)}. Return JSON: { "recommendations": "...", "proposedAction": { "task": "...", "assignee": "...", "dueDate": "..." } }`;
    const text = await getChatResponse(prompt, 'strategist');
    try {
        const parsed = JSON.parse(text);
        return {
            recommendations: parsed.recommendations,
            proposedAction: {
                ...parsed.proposedAction,
                id: `ai-${Math.random().toString(36).substr(2, 9)}`,
                status: 'pending'
            }
        };
    } catch {
        return {
            recommendations: "Error analyzing gaps",
            proposedAction: {
                id: 'error-action',
                task: "Contact HR",
                assignee: "Admin",
                dueDate: "ASAP",
                status: 'pending'
            }
        };
    }
};

export const getKpiAnalysis = async (title: string, data: any): Promise<string> => {
    return getChatResponse(`Analyze KPI "${title}" with data: ${JSON.stringify(data)}. One paragraph strategic summary.`);
};