import type { Employee, JobRole, HrMetricsData } from '../types';

// SINGLE SOURCE OF TRUTH FOR MOCK DATA
let mockEmployees: Employee[] = [
    { 
        id: 1, name: { en: 'Ana Ivanova', ka: 'ანა ივანოვა' }, currentRole: { en: 'CEO', ka: 'აღმასრულებელი დირექტორი' }, department: { en: 'Management', ka: 'მენეჯმენტი' }, hireDate: '2018-01-15', education: { en: 'Harvard Business School', ka: 'ჰარვარდის ბიზნეს სკოლა' }, skills: ['Leadership', 'Strategy', 'Finance'], performanceScore: 98, grade: 'A', 
        careerGoals: [{en: 'Expand to European market', ka: 'ევროპის ბაზარზე გასვლა'}], 
        performanceData: [
            { month: 'May', engagement: 9, productivity: 10, wellbeing: 8 },
            { month: 'Jun', engagement: 10, productivity: 10, wellbeing: 9 },
            { month: 'Jul', engagement: 9, productivity: 10, wellbeing: 8 },
        ],
        feedback: { en: "Ana's strategic vision has been pivotal to our growth this year.", ka: "ანას სტრატეგიული ხედვა გადამწყვეტი იყო ჩვენი ზრდისთვის ამ წელს." },
        digitalTwin: { engagementTrend: 'stable', readiness: { score: 98, status: 'Ready Now' }, sentiment: 'Positive' }
    },
    { 
        id: 2, name: { en: 'Luka Japaridze', ka: 'ლუკა ჯაფარიძე' }, currentRole: { en: 'CTO', ka: 'ტექნიკური დირექტორი' }, department: { en: 'Technology', ka: 'ტექნოლოგიები' }, hireDate: '2019-03-20', education: { en: 'Georgian Technical University', ka: 'საქართველოს ტექნიკური უნივერსიტეტი' }, skills: ['System Architecture', 'AI/ML', 'Team Leadership'], performanceScore: 95, grade: 'A',
        careerGoals: [{en: 'Implement a new microservices architecture', ka: 'ახალი მიკროსერვისების არქიტექტურის დანერგვა'}], 
        performanceData: [
            { month: 'May', engagement: 9, productivity: 9, wellbeing: 7 },
            { month: 'Jun', engagement: 9, productivity: 10, wellbeing: 8 },
            { month: 'Jul', engagement: 10, productivity: 9, wellbeing: 8 },
        ],
        feedback: { en: 'Luka is a technical powerhouse, driving our innovation forward.', ka: 'ლუკა ტექნიკურად ძალიან ძლიერია და ჩვენს ინოვაციებს უძღვება.' },
        digitalTwin: { engagementTrend: 'up', readiness: { score: 95, status: 'Ready Now' }, sentiment: 'Positive' }
    },
    { 
        id: 3, name: { en: 'Sandro Tskitishvili', ka: 'სანდრო ცქიტიშვილი' }, currentRole: { en: 'Lead Software Engineer', ka: 'წამყვანი პროგრამული ინჟინერი' }, department: { en: 'Engineering', ka: 'ინჟინერია' }, hireDate: '2020-08-15', education: { en: 'Free University', ka: 'თავისუფალი უნივერსიტეტი' }, skills: ['React', 'Node.js', 'TypeScript', 'DevOps'], performanceScore: 92, grade: 'A', 
        careerGoals: [{ en: 'Become a team lead', ka: 'გუნდის ხელმძღვანელობა' }],
        performanceData: [
            { month: 'May', engagement: 8, productivity: 9, wellbeing: 7 },
            { month: 'Jun', engagement: 9, productivity: 9, wellbeing: 8 },
            { month: 'Jul', engagement: 8, productivity: 10, wellbeing: 7 },
        ],
        feedback: { en: 'Sandro is a key contributor to our frontend architecture and a great mentor.', ka: 'სანდრო ჩვენი ფრონტენდ არქიტექტურის საკვანძო ფიგურაა და შესანიშნავი მენტორი.' },
        digitalTwin: { engagementTrend: 'stable', readiness: { score: 85, status: 'Ready in 1-2 years' }, sentiment: 'Positive' }
    },
    { 
        id: 4, name: { en: 'Mariam Abashidze', ka: 'მარიამ აბაშიძე' }, currentRole: { en: 'Senior Product Manager', ka: 'უფროსი პროდუქტ მენეჯერი' }, department: { en: 'Product', ka: 'პროდუქტი' }, hireDate: '2021-05-20', education: { en: 'Tbilisi State University', ka: 'თბილისის სახელმწიფო უნივერსიტეტი' }, skills: ['Agile', 'Roadmap Planning', 'JIRA', 'User Research'], performanceScore: 90, grade: 'A', 
        careerGoals: [{en: 'Lead the entire product division', ka: 'პროდუქტის დივიზიონის ხელმძღვანელობა'}],
        performanceData: [
            { month: 'May', engagement: 9, productivity: 8, wellbeing: 8 },
            { month: 'Jun', engagement: 9, productivity: 9, wellbeing: 9 },
            { month: 'Jul', engagement: 9, productivity: 9, wellbeing: 8 },
        ],
        feedback: { en: 'Mariam has excellent product sense and keeps the team focused on user needs.', ka: 'მარიამს პროდუქტის შესანიშნავი ხედვა აქვს და გუნდს მომხმარებლის საჭიროებებზე ამახვილებინებს ყურადღებას.' },
        digitalTwin: { engagementTrend: 'up', readiness: { score: 90, status: 'Ready Now' }, sentiment: 'Positive' }
    },
    { 
        id: 5, name: { en: 'Levan Gelovani', ka: 'ლევან გელოვანი' }, currentRole: { en: 'Software Engineer', ka: 'პროგრამული ინჟინერი' }, department: { en: 'Engineering', ka: 'ინჟინერია' }, hireDate: '2023-01-10', education: { en: 'Business and Technology University', ka: 'ბიზნესისა და ტექნოლოგიების უნივერსიტეტი' }, skills: ['React', 'CSS', 'JavaScript'], performanceScore: 85, grade: 'B', 
        careerGoals: [{en: 'Learn backend technologies', ka: 'backend ტექნოლოგიების შესწავლა'}],
        performanceData: [
            { month: 'May', engagement: 7, productivity: 8, wellbeing: 6 },
            { month: 'Jun', engagement: 6, productivity: 7, wellbeing: 5 },
            { month: 'Jul', engagement: 6, productivity: 6, wellbeing: 4 },
        ],
        feedback: { en: "Levan is a fast learner, but has seemed less engaged recently. Needs more challenging tasks to stay motivated.", ka: "ლევანი სწრაფად სწავლობს, მაგრამ ბოლო დროს ნაკლებად ჩართული ჩანს. მეტი რთული დავალება სჭირდება მოტივაციისთვის." },
        digitalTwin: { engagementTrend: 'down', readiness: { score: 60, status: 'Needs Development' }, sentiment: 'Neutral' }
    },
];

let mockJobRoles: JobRole[] = [
    { id: 1, title: { en: 'Software Engineer', ka: 'პროგრამული უზრუნველყოფის ინჟინერი' }, requiredSkills: ['React', 'Node.js', 'TypeScript', 'SQL'] },
    { id: 2, title: { en: 'Product Manager', ka: 'პროდუქტის მენეჯერი' }, requiredSkills: ['Agile', 'Roadmap Planning', 'User Research', 'Data Analysis'] },
    { id: 3, title: { en: 'UI/UX Designer', ka: 'UI/UX დიზაინერი' }, requiredSkills: ['Figma', 'User Persona', 'Prototyping'] },
];

let hrMetricsData: HrMetricsData = {
    summary: {
        turnoverRate: { value: 12, unit: '%' },
        engagementScore: { value: 4.2, unit: '/ 5' },
        onboardingCost: { value: '₾4,500' },
        trainingSpend: { value: '₾120,000' },
    },
    breakdown: {
        trainingHoursByDept: [
            { dept: 'Engineering', hours: 68 },
            { dept: 'Product', hours: 45 },
            { dept: 'Sales', hours: 32 },
            { dept: 'Marketing', hours: 25 },
        ]
    }
};


const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Employee Service
export const getEmployees = async (): Promise<Employee[]> => {
    await simulateDelay(500);
    return [...mockEmployees];
};

// Job Role Service
export const getJobRoles = async (): Promise<JobRole[]> => {
    await simulateDelay(300);
    return [...mockJobRoles];
};

export const addJobRole = async (roleData: { title: { en: string; ka: string; }, requiredSkills: string[] }): Promise<JobRole> => {
    await simulateDelay(400);
    const newRole: JobRole = {
        id: Date.now(),
        ...roleData,
    };
    mockJobRoles.push(newRole);
    return newRole;
};

export const updateJobRole = async (role: JobRole): Promise<JobRole> => {
    await simulateDelay(400);
    const index = mockJobRoles.findIndex(r => r.id === role.id);
    if (index !== -1) {
        mockJobRoles[index] = role;
        return role;
    }
    throw new Error("Role not found");
};

export const deleteJobRole = async (id: number): Promise<{ id: number }> => {
    await simulateDelay(400);
    mockJobRoles = mockJobRoles.filter(r => r.id !== id);
    return { id };
};

// HR Metrics Service
export const getHrMetrics = async (): Promise<HrMetricsData> => {
    await simulateDelay(200);
    return JSON.parse(JSON.stringify(hrMetricsData)); // Deep copy
};