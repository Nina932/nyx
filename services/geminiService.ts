
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { GroundingChunk, Employee, CareerPath, JobRole, SkillGap, PerformanceData, Policy, TrainingCourse, SimulationStepResult, DataQueryResult, AiAction } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Please set your API key for the app to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type Persona = 'general' | 'strategist' | 'data_analyst';

const personaConfig: Record<Persona, { model: string; systemInstruction: string }> = {
    general: {
        model: 'gemini-2.5-flash',
        systemInstruction: "You are a helpful, general-purpose HR assistant for the NYX platform. Be concise and professional."
    },
    strategist: {
        model: 'gemini-2.5-pro',
        systemInstruction: "You are an expert HR Strategist. Provide insightful, high-level analysis and recommendations. Think about the long-term impact on the organization."
    },
    data_analyst: {
        model: 'gemini-2.5-flash',
        systemInstruction: "You are a meticulous Data Analyst. Focus on the numbers and facts. When asked about data, be precise and structured in your response."
    }
};

export const getChatResponse = async (prompt: string, persona: Persona = 'general'): Promise<string> => {
  try {
    const config = personaConfig[persona];
    const response = await ai.models.generateContent({
      model: config.model,
      contents: prompt,
      config: {
        systemInstruction: config.systemInstruction
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error in getChatResponse:", error);
    return "Sorry, I encountered an error. Please check the console for details.";
  }
};

export const getThinkingResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error in getThinkingResponse:", error);
    return "Sorry, I encountered an error while thinking. Please check the console for details.";
  }
};

interface GroundedResponse {
    text: string;
    grounding: GroundingChunk[];
}

export const getSearchGroundedResponse = async (prompt: string): Promise<GroundedResponse> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text;
        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        return { text, grounding: grounding as GroundingChunk[] };
    } catch (error) {
        console.error("Error in getSearchGroundedResponse:", error);
        return { text: "Sorry, I couldn't search for that. Please check the console.", grounding: [] };
    }
};

export const getMapsGroundedResponse = async (prompt: string): Promise<GroundedResponse> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: 37.78193,
                            longitude: -122.40476, // Mock location (San Francisco)
                        },
                    },
                },
            },
        });
        
        const text = response.text;
        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { text, grounding: grounding as GroundingChunk[] };
    } catch (error) {
        console.error("Error in getMapsGroundedResponse:", error);
        return { text: "Sorry, I couldn't find that on the map. Please check the console.", grounding: [] };
    }
};

export const getCareerPath = async (employee: Employee): Promise<CareerPath> => {
  const prompt = `
    Analyze the following employee profile for a tech company in Tbilisi, Georgia and generate a personalized 2-step career progression path.

    Employee Profile:
    - Name: ${employee.name.en}
    - Current Role: ${employee.currentRole.en}
    - Current Skills: ${employee.skills.join(', ')}
    - Performance Score: ${employee.performanceScore}/100
    - Stated Career Goals: ${employee.careerGoals.map(g => g.en).join(', ')}

    Based on this profile, suggest a realistic and ambitious career path. For each of the 2 steps, provide:
    1. A potential next role title.
    2. A brief, one-sentence description of that role's core responsibility.
    3. A list of 3 key skills they need to develop.
    4. A list of 2 recommended training courses or actions (e.g., 'TBC IT Academy - Advanced Node.js', 'Mentorship with a Senior Architect').

    Return ONLY the JSON object. The path should start from their current role.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as CareerPath;

  } catch (error) {
    console.error("Error in getCareerPath:", error);
    throw new Error("Failed to generate career path. Please check the console for details.");
  }
};


export const getSkillGapAnalysis = async (employees: Employee[], roles: JobRole[]): Promise<SkillGap[]> => {
    const prompt = `
        Analyze the provided list of employees and their skills against the job role requirements for the entire organization based in Georgia.

        Job Roles and Required Skills:
        ${roles.map(r => `- ${r.title.en}: ${r.requiredSkills.join(', ')}`).join('\n')}

        Employees and Their Current Skills:
        ${employees.map(e => `- ${e.name.en} (${e.currentRole.en}): ${e.skills.join(', ')}`).join('\n')}

        Based on this data, identify the top 3 most critical skill gaps across the organization. A skill gap exists when an employee in a certain role lacks a skill required for that role.

        For each identified skill gap, provide:
        1. The name of the skill.
        2. The total number of employees who have this gap.
        3. An importance level ('High', 'Medium', or 'Low') based on how many roles require it.
        4. A list of 1-2 recommended training programs to address the gap (e.g., 'Skillwill Course', 'Internal Workshop').

        Return ONLY the JSON array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            skill: { type: Type.STRING },
                            gapCount: { type: Type.INTEGER },
                            importance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                            recommendedTraining: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['skill', 'gapCount', 'importance', 'recommendedTraining']
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SkillGap[];
    } catch (error) {
        console.error("Error in getSkillGapAnalysis:", error);
        throw new Error("Failed to generate skill gap analysis.");
    }
};

export const suggestSkillsForRole = async (roleTitle: string): Promise<string[]> => {
    const prompt = `
    Based on the job title "${roleTitle}" for a position at an HR Tech company in Tbilisi, Georgia, suggest a concise list of 5-7 essential required skills.
    Include a mix of technical and soft skills relevant to the role and the industry.

    Return ONLY a JSON object with a single key "skills" which is an array of strings. For example: { "skills": ["Skill1", "Skill2"] }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        skills: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['skills']
                }
            }
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.skills as string[];
    } catch (error) {
        console.error("Error in suggestSkillsForRole:", error);
        throw new Error("Failed to suggest skills for the role.");
    }
};

export const analyzePerformance = async (employeeName: string, performanceData: PerformanceData[], feedback: string) => {
    const prompt = `
    Analyze the last 3 months of performance data and recent feedback for an employee named ${employeeName}.
    
    Performance Data (1-10 scale): ${JSON.stringify(performanceData)}
    - Engagement: How motivated and involved they are.
    - Productivity: How much work they are completing.
    - Wellbeing: Self-reported well-being, lower is worse.

    Recent Manager Feedback: "${feedback}"

    Based on ALL this data, provide a concise analysis:
    1.  **Sentiment Analysis**: Analyze the manager's feedback. Provide a sentiment 'score' from -1 (very negative) to 1 (very positive) and a 'label' ('Positive', 'Neutral', 'Negative').
    2.  **Burnout Risk**: Based on performance data and sentiment, is there a burnout risk? ('Low', 'Medium', 'High'). A consistent decline in all metrics, especially wellbeing, combined with negative sentiment indicates high risk.
    3.  **Performance Trend**: What is the overall performance trend? ('Improving', 'Stable', 'Declining').
    4.  **Recommendations**: Provide two actionable, supportive recommendations for the employee or their manager that consider both the quantitative data and the qualitative feedback.

    Return ONLY a JSON object.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.NUMBER },
                                label: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] }
                            },
                            required: ['score', 'label']
                        },
                        burnoutRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                        trend: { type: Type.STRING },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['sentiment', 'burnoutRisk', 'trend', 'recommendations']
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error in analyzePerformance:", error);
        throw new Error("Failed to analyze performance data.");
    }
};

export const analyzeDocument = async (text: string, task: 'summarize' | 'comply'): Promise<string> => {
    const complianceRules = `
    1.  The agreement must specify a probation period no longer than 6 months.
    2.  Annual leave must be at least 24 working days.
    3.  Termination requires at least 30 days' notice from the employer.
    4.  Overtime must be compensated at a rate of at least 125% of the normal hourly wage.
    `;
    const prompt = task === 'summarize'
        ? `Summarize the key points of the following document in a few bullet points:\n\n${text}`
        : `Analyze the following labor agreement text and check if it complies with these rules based on Georgian labor law. For each rule, state if it is "Compliant", "Non-Compliant", or "Not Mentioned". Provide a brief explanation for any non-compliant points.\n\nRules:\n${complianceRules}\n\nDocument Text:\n${text}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error in analyzeDocument:", error);
        return "Failed to analyze the document.";
    }
};

export const answerPolicyQuestion = async (policy: Policy, question: string): Promise<string> => {
    const prompt = `
    You are an HR Compliance Agent powered by Vertex AI. Answer the user's question based *only* on the provided company policy text. If the answer is not in the text, clearly state that the policy does not cover this topic.

    Policy Title: ${policy.title.en}
    Policy Content:
    ---
    ${policy.content.en}
    ---

    User Question: "${question}"

    Answer:
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error in answerPolicyQuestion:", error);
        return "Failed to get an answer from the policy.";
    }
};

export const suggestTrainingPrograms = async (skill: string): Promise<Omit<TrainingCourse, 'id'>[]> => {
    const prompt = `
    Based on the skill "${skill}", suggest a list of 3 relevant training programs or courses available in Georgia or online.
    For each suggestion, provide:
    1. A realistic "title" for the course.
    2. A plausible "provider" (e.g., TBC IT Academy, Skillwill, Coursera, Udemy).
    3. A typical "duration" (e.g., "6 Weeks", "3 Months", "Self-paced").

    Return ONLY a JSON object with a single key "suggestions" which is an array of objects.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    provider: { type: Type.STRING },
                                    duration: { type: Type.STRING }
                                },
                                required: ['title', 'provider', 'duration']
                            }
                        }
                    },
                    required: ['suggestions']
                }
            }
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.suggestions as Omit<TrainingCourse, 'id'>[];
    } catch (error) {
        console.error("Error in suggestTrainingPrograms:", error);
        throw new Error("Failed to suggest training programs.");
    }
};

export const analyzeRevenueTrend = async (): Promise<string> => {
    const prompt = "Analyze the provided revenue data (in thousands) for the first 7 months: Jan: 2400, Feb: 2210, Mar: 2290, Apr: 2000, May: 2181, Jun: 2500, Jul: 2100. Provide a one-sentence summary of the overall trend and one key insight.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error in analyzeRevenueTrend:", error);
        return "Failed to analyze revenue trend.";
    }
};

export const runBusinessSimulation = async (scenarioPrompt: string, choicePrompt: string): Promise<SimulationStepResult> => {
    const prompt = `
    You are a business simulation engine. The user is in a scenario and has made a decision.
    Current Scenario: ${scenarioPrompt}
    User's Decision: ${choicePrompt}

    Based on the decision, provide a realistic "outcome" of their action.
    Then, create a "newSituation" that results from this outcome.
    Finally, provide two distinct "newChoices" for the user to make in this new situation. Each choice should have a 'textKey' (a short, one-word identifier in camelCase) and a 'prompt' (the full text of the choice).

    Both 'outcome' and 'newSituation' should be in English. The 'prompt' for each new choice should be an object with 'en' and 'ka' keys for bilingual support.

    Return ONLY a JSON object.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
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
                                            ka: { type: Type.STRING }
                                        },
                                        required: ['en', 'ka']
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
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SimulationStepResult;
    } catch (error) {
        console.error("Error in runBusinessSimulation:", error);
        throw new Error("Failed to run the business simulation step.");
    }
};

export const extractInfoFromDoc = async (docText: string, docType: 'cv' | 'contract'): Promise<any> => {
    const prompt = `
    Act as a Document AI extractor. Analyze the following document text and extract the specified information into a structured JSON object.
    Document Type: ${docType}
    Document Text: """${docText}"""

    Return ONLY the JSON object.
    `;
    const schema = docType === 'cv' ? {
        type: Type.OBJECT,
        properties: {
            fullName: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            yearsOfExperience: { type: Type.NUMBER },
        },
    } : {
        type: Type.OBJECT,
        properties: {
            parties: { type: Type.ARRAY, items: { type: Type.STRING } },
            effectiveDate: { type: Type.STRING },
            terminationClause: { type: Type.STRING },
            probationPeriod: { type: Type.STRING },
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error in extractInfoFromDoc:", error);
        throw new Error("Failed to extract information from the document.");
    }
};

export const processDataQuery = async (query: string): Promise<DataQueryResult> => {
    const prompt = `
    Simulate a two-agent system for a user's data query.
    User Query: "${query}"

    **Agent 1 (LLM Business Analyst):**
    1.  Create a high-level, step-by-step "plan" for how you would answer the user's query. This should be a human-readable list of actions, not SQL.
    2.  Based on the plan, generate a mock result set of 2-4 records that plausibly answers the question. The available data context includes employee 'name', 'role', 'department', 'salary'.
    3.  To simulate a real-world data issue, if the query involves roles and salaries, **deliberately include one logical error** in the mock data (e.g., a 'Junior' role with an unusually high salary like 8000, or a 'Head' with a very low one like 2000).

    **Agent 2 (Validation Agent):**
    1.  Analyze the mock data generated by Agent 1.
    2.  Check for logical inconsistencies, specifically focusing on salary ranges for different roles (e.g., Junior, Senior, Head).
    3.  If an inconsistency is found, create a "validationError" message (a string) explaining the potential issue. Otherwise, this field should be null.

    Return ONLY a JSON object with three keys: "plan" (string), "result" (array of objects), and "validationError" (string or null).
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        plan: { type: Type.STRING },
                        result: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {} } },
                        validationError: { type: Type.STRING, nullable: true }
                    },
                    required: ['plan', 'result']
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DataQueryResult;
    } catch (error) {
        console.error("Error in processDataQuery:", error);
        throw new Error("Failed to process the data query.");
    }
};

export const getGapClosureRecommendations = async (gaps: SkillGap[]): Promise<{ recommendations: string; proposedAction: AiAction; }> => {
    const prompt = `
    As an expert HR strategist, analyze the following organizational skill gaps for a tech company in Georgia. The highest importance skill is the most critical to address.

    Top Skill Gaps:
    ${gaps.map(g => `- Skill: ${g.skill}, Importance: ${g.importance}, Employees Affected: ${g.gapCount}`).join('\n')}

    1.  Provide a high-level, strategic plan to address these gaps. Suggest 2-3 concrete actions in a "recommendations" string. The recommendations should be concise, actionable, and suitable for a leadership summary.
    2.  Based on the most critical gap, create a single, high-priority "proposedAction" object. This action should be a tangible first step. The object should contain:
        - "task": A clear, imperative task description (e.g., "Launch a targeted upskilling program for 'Data Analysis'").
        - "assignee": A plausible role to own this task (e.g., "L&D Coordinator", "Head of Engineering").
        - "dueDate": A realistic due date from today (e.g., "In 2 weeks", "End of Q3").

    Return ONLY a JSON object with "recommendations" and "proposedAction".
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendations: { type: Type.STRING },
                        proposedAction: {
                            type: Type.OBJECT,
                            properties: {
                                task: { type: Type.STRING },
                                assignee: { type: Type.STRING },
                                dueDate: { type: Type.STRING },
                            },
                            required: ["task", "assignee", "dueDate"]
                        }
                    },
                    required: ["recommendations", "proposedAction"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as { recommendations: string; proposedAction: AiAction; };
    } catch (error) {
        console.error("Error in getGapClosureRecommendations:", error);
        throw new Error("Failed to generate gap closure recommendations.");
    }
};

export const getKpiAnalysis = async (title: string, data: any): Promise<string> => {
    const prompt = `
    As an expert HR Strategist, analyze the following Key Performance Indicator (KPI) data for a company.
    KPI Title: "${title}"
    Data:
    ---
    ${JSON.stringify(data, null, 2)}
    ---

    Provide a concise, one-paragraph strategic summary. Highlight the most important takeaway or suggest a potential area for investigation. Be insightful and direct.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Error in getKpiAnalysis for ${title}:`, error);
        return "Failed to generate AI analysis for this KPI.";
    }
};