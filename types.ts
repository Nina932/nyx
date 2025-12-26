export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            uri: string;
            title: string;
            text: string;
        }[];
    }
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  grounding?: GroundingChunk[];
}

// Bilingual Support
export type LocalizedString = {
    en: string;
    ka: string;
}

// For Employee Performance Analysis
export interface PerformanceData {
    month: string;
    engagement: number; // 1-10
    productivity: number; // 1-10
    wellbeing: number; // 1-10
}

export interface DigitalTwin {
    engagementTrend: 'up' | 'down' | 'stable';
    readiness: {
        score: number; // 0-100
        status: 'Ready Now' | 'Ready in 1-2 years' | 'Needs Development';
    };
    sentiment: 'Positive' | 'Neutral' | 'Negative';
}

// For Employee Module
export interface Employee {
  id: number;
  name: LocalizedString;
  currentRole: LocalizedString;
  department: LocalizedString;
  hireDate: string; // YYYY-MM-DD
  education: LocalizedString;
  skills: string[];
  performanceScore: number; // out of 100
  careerGoals: LocalizedString[];
  performanceData: PerformanceData[];
  grade: string; // e.g., 'A+', 'B', 'C-'
  feedback: LocalizedString;
  digitalTwin: DigitalTwin;
}

export interface HighPotentialEmployee extends Employee {}
export interface ManagerInTraining extends Employee {}


export interface CareerStep {
  role: string;
  description: string;
  skillsToDevelop: string[];
  recommendedTraining: string[];
}

export interface CareerPath {
  currentRole: string;
  suggestedPath: CareerStep[];
}

// For Skill Gap Analysis & Competency Module
export interface JobRole {
  id: number;
  title: LocalizedString;
  requiredSkills: string[];
}

export interface SkillGap {
  skill: string;
  gapCount: number; // Number of employees lacking this skill for their role
  importance: 'High' | 'Medium' | 'Low';
  recommendedTraining: string[];
}

export interface AiAction {
    id: string;
    task: string;
    assignee: string;
    dueDate: string;
    status: 'pending' | 'approved' | 'rejected';
}


// For Policies Module
export interface Policy {
    id: number;
    title: LocalizedString;
    content: LocalizedString;
}

// For Training Module
export interface TrainingCourse {
    id: number;
    title: string;
    provider: string;
    duration: string; // e.g., "6 Weeks"
}

export interface TrainingEnrollment {
    employeeId: number;
    employeeName: LocalizedString;
    courseId: number;
    courseTitle: LocalizedString;
    status: 'In Progress' | 'Completed' | 'Not Started';
    progress: number; // 0-100
}

// For Business Simulation Module
export interface SimulationScenario {
    id: string;
    titleKey: string;
    initialPrompt: LocalizedString;
    initialChoices: {
        textKey: string;
        prompt: LocalizedString;
    }[];
}

export interface SimulationStepResult {
    outcome: string;
    newSituation: string;
    newChoices: {
        textKey: string;
        prompt: LocalizedString;
    }[];
}

// For Org Chart Module
export interface OrgChartNode {
    id: number;
    name: LocalizedString;
    role: LocalizedString;
    avatarUrl?: string;
    reports?: OrgChartNode[];
}

// For Data Query Agent
export interface DataQueryResult {
    plan: string;
    result: any[];
    validationError?: string;
}

// For Dashboard HR Metrics
export interface HrMetricsData {
    summary: {
        turnoverRate: { value: number, unit: '%' };
        engagementScore: { value: number, unit: '/ 5' };
        onboardingCost: { value: string };
        trainingSpend: { value: string };
    };
    breakdown: {
        trainingHoursByDept: { dept: string, hours: number }[];
    };
}