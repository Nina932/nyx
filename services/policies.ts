
import type { Policy } from '../types';

let mockPolicies: Policy[] = [
    { id: 1, title: { en: 'Labor Agreement Policy', ka: 'შრომითი ხელშეკრულების პოლიტიკა' }, content: { en: 'All employees must have a written labor agreement. The probation period cannot exceed 6 months. Annual paid leave is 24 working days.', ka: 'ყველა თანამშრომელთან ფორმდება წერილობითი შრომითი ხელშეკრულება. გამოსაცდელი ვადა არ უნდა აღემატებოდეს 6 თვეს. წლიური ანაზღაურებადი შვებულება შეადგენს 24 სამუშაო დღეს.' } },
    { id: 2, title: { en: 'Remote Work Policy', ka: 'დისტანციური მუშაობის პოლიტიკა' }, content: { en: 'Employees are allowed 2 remote work days per week. Remote days must be agreed upon with their direct manager. The company provides necessary technical equipment.', ka: 'თანამშრომლებს ეძლევათ კვირაში 2 დღე დისტანციურად მუშაობის უფლება. დისტანციური მუშაობის დღეები უნდა შეთანხმდეს უშუალო ხელმძღვანელთან. კომპანია უზრუნველყოფს საჭირო ტექნიკურ აღჭურვილობას.' } },
    { id: 3, title: { en: 'Confidentiality Policy', ka: 'კონფიდენციალურობის პოლიტიკა' }, content: { en: 'Employees are obligated to protect the company\'s trade secrets. Transferring any confidential information to third parties is prohibited.', ka: 'თანამშრომლები ვალდებულნი არიან დაიცვან კომპანიის კომერციული საიდუმლოება. აკრძალულია ნებისმიერი კონფიდენციალური ინფორმაციის მესამე პირებისთვის გადაცემა.' } }
];

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getPolicies = async (): Promise<Policy[]> => {
    await simulateDelay(300);
    return [...mockPolicies];
};

export const addPolicy = async (policyData: { title: { en: string; ka: string; }, content: { en: string; ka: string; } }): Promise<Policy> => {
    await simulateDelay(400);
    const newPolicy: Policy = {
        id: Date.now(),
        ...policyData,
    };
    mockPolicies.push(newPolicy);
    return newPolicy;
};
