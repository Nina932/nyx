import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Starting TypeScript seeding...');

    // Admin user (use upsert by unique email)
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@nyx.ge' },
        update: { passwordHash: adminPasswordHash, role: 'ADMIN' },
        create: {
            email: 'admin@nyx.ge',
            passwordHash: adminPasswordHash,
            role: 'ADMIN',
        },
    });
    console.log('✅ Admin user seeded');

    // Job roles (createMany for speed; Prisma createMany ignores relations)
    await prisma.jobRole.createMany({
        skipDuplicates: true,
        data: [
            {
                titleEn: 'Software Engineer',
                titleKa: 'პროგრამული უზრუნველყოფის ინჟინერი',
                requiredSkills: JSON.stringify(['React', 'Node.js', 'TypeScript', 'SQL']),
            },
            {
                titleEn: 'Product Manager',
                titleKa: 'პროდუქტის მენეჯერი',
                requiredSkills: JSON.stringify(['Agile', 'Roadmap Planning', 'User Research', 'Data Analysis']),
            },
            {
                titleEn: 'UI/UX Designer',
                titleKa: 'UI/UX დიზაინერი',
                requiredSkills: JSON.stringify(['Figma', 'User Persona', 'Prototyping']),
            },
        ],
    });
    console.log('✅ Job roles created (createMany)');

    // Employees (createMany). Note: createMany cannot set relations by nested create; set jobRoleId numerically where applicable.
    await prisma.employee.createMany({
        skipDuplicates: true,
        data: [
            {
                nameEn: 'Ana Ivanova',
                nameKa: 'ანა ივანოვა',
                currentRoleEn: 'CEO',
                currentRoleKa: 'აღმასრულებელი დირექტორი',
                departmentEn: 'Management',
                departmentKa: 'მენეჯმენტი',
                hireDate: new Date('2018-01-15'),
                educationEn: 'Harvard Business School',
                educationKa: 'ჰარვარდის ბიზნეს სკოლა',
                skills: JSON.stringify(['Leadership', 'Strategy', 'Finance']),
                performanceScore: 98,
                grade: 'A',
                careerGoalsEn: JSON.stringify(['Expand to European market']),
                careerGoalsKa: JSON.stringify(['ევროპის ბაზარზე გასვლა']),
                performanceData: JSON.stringify([
                    { month: 'May', engagement: 9, productivity: 10, wellbeing: 8 },
                    { month: 'Jun', engagement: 10, productivity: 10, wellbeing: 9 },
                    { month: 'Jul', engagement: 9, productivity: 10, wellbeing: 8 },
                ]),
                feedbackEn: "Ana's strategic vision has been pivotal to our growth this year.",
                feedbackKa: 'ანას სტრატეგიული ხედვა გადამწყვეტი იყო ჩვენი ზრდისთვის ამ წელს.',
                digitalTwin: JSON.stringify({
                    engagementTrend: 'stable',
                    readiness: { score: 98, status: 'Ready Now' },
                    sentiment: 'Positive',
                }),
            },
            {
                nameEn: 'Luka Japaridze',
                nameKa: 'ლუკა ჯაფარიძე',
                currentRoleEn: 'CTO',
                currentRoleKa: 'ტექნიკური დირექტორი',
                departmentEn: 'Technology',
                departmentKa: 'ტექნოლოგიები',
                hireDate: new Date('2019-03-20'),
                educationEn: 'Georgian Technical University',
                educationKa: 'საქართველოს ტექნიკური უნივერსიტეტი',
                skills: JSON.stringify(['System Architecture', 'AI/ML', 'Team Leadership']),
                performanceScore: 95,
                grade: 'A',
                careerGoalsEn: JSON.stringify(['Implement a new microservices architecture']),
                careerGoalsKa: JSON.stringify(['ახალი მიკროსერვისების არქიტექტურის დანერგვა']),
                performanceData: JSON.stringify([
                    { month: 'May', engagement: 9, productivity: 9, wellbeing: 7 },
                    { month: 'Jun', engagement: 9, productivity: 10, wellbeing: 8 },
                    { month: 'Jul', engagement: 10, productivity: 9, wellbeing: 8 },
                ]),
                feedbackEn: 'Luka is a technical powerhouse, driving our innovation forward.',
                feedbackKa: 'ლუკა ტექნიკურად ძალიან ძლიერია და ჩვენს ინოვაციებს უძღვება.',
                digitalTwin: JSON.stringify({
                    engagementTrend: 'up',
                    readiness: { score: 95, status: 'Ready Now' },
                    sentiment: 'Positive',
                }),
            },
            {
                nameEn: 'Sandro Tskitishvili',
                nameKa: 'სანდრო ცქიტიშვილი',
                currentRoleEn: 'Lead Software Engineer',
                currentRoleKa: 'წამყვანი პროგრამული ინჟინერი',
                departmentEn: 'Engineering',
                departmentKa: 'ინჟინერია',
                hireDate: new Date('2020-08-15'),
                educationEn: 'Free University',
                educationKa: 'თავისუფალი უნივერსიტეტი',
                skills: JSON.stringify(['React', 'Node.js', 'TypeScript', 'DevOps']),
                performanceScore: 92,
                grade: 'A',
                careerGoalsEn: JSON.stringify(['Become a team lead']),
                careerGoalsKa: JSON.stringify(['გუნდის ხელმძღვანელობა']),
                performanceData: JSON.stringify([
                    { month: 'May', engagement: 8, productivity: 9, wellbeing: 7 },
                    { month: 'Jun', engagement: 9, productivity: 9, wellbeing: 8 },
                    { month: 'Jul', engagement: 8, productivity: 10, wellbeing: 7 },
                ]),
                feedbackEn: 'Sandro is a key contributor to our frontend architecture and a great mentor.',
                feedbackKa: 'სანდრო ჩვენი ფრონტენდ არქიტექტურის საკვანძო ფიგურაა და შესანიშნავი მენტორი.',
                digitalTwin: JSON.stringify({
                    engagementTrend: 'stable',
                    readiness: { score: 85, status: 'Ready in 1-2 years' },
                    sentiment: 'Positive',
                }),
                jobRoleId: 1,
            },
            {
                nameEn: 'Mariam Abashidze',
                nameKa: 'მარიამ აბაშიძე',
                currentRoleEn: 'Senior Product Manager',
                currentRoleKa: 'უფროსი პროდუქტ მენეჯერი',
                departmentEn: 'Product',
                departmentKa: 'პროდუქტი',
                hireDate: new Date('2021-05-20'),
                educationEn: 'Tbilisi State University',
                educationKa: 'თბილისის სახელმწიფო უნივერსიტეტი',
                skills: JSON.stringify(['Agile', 'Roadmap Planning', 'JIRA', 'User Research']),
                performanceScore: 90,
                grade: 'A',
                careerGoalsEn: JSON.stringify(['Lead the entire product division']),
                careerGoalsKa: JSON.stringify(['პროდუქტის დივიზიონის ხელმძღვანელობა']),
                performanceData: JSON.stringify([
                    { month: 'May', engagement: 9, productivity: 8, wellbeing: 8 },
                    { month: 'Jun', engagement: 9, productivity: 9, wellbeing: 9 },
                    { month: 'Jul', engagement: 9, productivity: 9, wellbeing: 8 },
                ]),
                feedbackEn: 'Mariam has excellent product sense and keeps the team focused on user needs.',
                feedbackKa: 'მარიამს პროდუქტის შესანიშნავი ხედვა აქვს და გუნდს მომხმარებლის საჭიროებებზე ამახვილებინებს ყურადღებას.',
                digitalTwin: JSON.stringify({
                    engagementTrend: 'up',
                    readiness: { score: 90, status: 'Ready Now' },
                    sentiment: 'Positive',
                }),
                jobRoleId: 2,
            },
            {
                nameEn: 'Levan Gelovani',
                nameKa: 'ლევან გელოვანი',
                currentRoleEn: 'Software Engineer',
                currentRoleKa: 'პროგრამული ინჟინერი',
                departmentEn: 'Engineering',
                departmentKa: 'ინჟინერია',
                hireDate: new Date('2023-01-10'),
                educationEn: 'Business and Technology University',
                educationKa: 'ბიზნესისა და ტექნოლოგიების უნივერსიტეტი',
                skills: JSON.stringify(['React', 'CSS', 'JavaScript']),
                performanceScore: 85,
                grade: 'B',
                careerGoalsEn: JSON.stringify(['Learn backend technologies']),
                careerGoalsKa: JSON.stringify(['backend ტექნოლოგიების შესწავლა']),
                performanceData: JSON.stringify([
                    { month: 'May', engagement: 7, productivity: 8, wellbeing: 6 },
                    { month: 'Jun', engagement: 6, productivity: 7, wellbeing: 5 },
                    { month: 'Jul', engagement: 6, productivity: 6, wellbeing: 4 },
                ]),
                feedbackEn: "Levan is a fast learner, but has seemed less engaged recently. Needs more challenging tasks to stay motivated.",
                feedbackKa: 'ლევანი სწრაფად სწავლობს, მაგრამ ბოლო დროს ნაკლებად ჩართული ჩანს. მეტი რთული დავალება სჭირდება მოტივაციისთვის.',
                digitalTwin: JSON.stringify({
                    engagementTrend: 'down',
                    readiness: { score: 60, status: 'Needs Development' },
                    sentiment: 'Neutral',
                }),
                jobRoleId: 1,
            },
        ],
    });
    console.log('✅ Employees created (createMany)');

    // Policies (createMany)
    await prisma.policy.createMany({
        skipDuplicates: true,
        data: [
            {
                titleEn: 'Remote Work Policy',
                titleKa: 'დისტანციური მუშაობის პოლიტიკა',
                contentEn: `Remote Work Policy
1. Eligibility: All full-time employees who have completed their probation period (3 months) are eligible for remote work.
2. Schedule: Employees may work remotely up to 3 days per week, with mandatory in-office presence on Tuesdays and Thursdays.
3. Equipment: The company will provide a laptop and monitor. Employees are responsible for their internet connection (minimum 50 Mbps).
4. Communication: Employees must be available on Slack during core hours (10:00 - 18:00 Tbilisi time).
5. Performance: Remote work privileges may be revoked if performance metrics decline significantly.`,
                contentKa: `დისტანციური მუშაობის პოლიტიკა
1. უფლებამოსილება: ყველა სრულ განაკვეთზე მომუშავე თანამშრომელი, რომელსაც გავლილი აქვს საცდელი ვადა (3 თვე), უფლებამოსილია დისტანციურად მუშაობისთვის.
2. გრაფიკი: თანამშრომლებს შეუძლიათ დისტანციურად იმუშაონ კვირაში 3 დღემდე, სამშაბათს და ხუთშაბათს ოფისში ყოფნა სავალდებულოა.
3. აღჭურვილობა: კომპანია უზრუნველყოფს ლეპტოპს და მონიტორს. თანამშრომლები პასუხისმგებელნი არიან საკუთარ ინტერნეტ კავშირზე (მინიმუმ 50 Mbps).
4. კომუნიკაცია: თანამშრომლები უნდა იყვნენ ხელმისაწვდომი Slack-ზე ძირითად საათებში (10:00 - 18:00 თბილისის დროით).
5. შესრულება: დისტანციური მუშაობის პრივილეგია შეიძლება გაუქმდეს, თუ შესრულების მაჩვენებლები მნიშვნელოვნად დაიკლებს.`,
            },
            {
                titleEn: 'Annual Leave Policy',
                titleKa: 'ყოველწლიური შვებულების პოლიტიკა',
                contentEn: `Annual Leave Policy
1. Entitlement: All employees are entitled to 24 working days of paid annual leave per year.
2. Accrual: Leave accrues monthly at a rate of 2 days per month.
3. Notice: Employees must request leave at least 2 weeks in advance for periods longer than 5 days.
4. Carryover: Unused leave up to 5 days may be carried over to the next year.
5. Public Holidays: Georgian public holidays are in addition to annual leave.`,
                contentKa: `ყოველწლიური შვებულების პოლიტიკა
1. უფლება: ყველა თანამშრომელს აქვს უფლება წელიწადში 24 სამუშაო დღის ანაზღაურებად ყოველწლიურ შვებულებაზე.
2. დაგროვება: შვებულება გროვდება ყოველთვიურად თვეში 2 დღის ოდენობით.
3. შეტყობინება: თანამშრომლებმა უნდა მოითხოვონ შვებულება მინიმუმ 2 კვირით ადრე 5 დღეზე მეტი პერიოდისთვის.
4. გადატანა: გამოუყენებელი შვებულება 5 დღემდე შეიძლება გადავიდეს მომდევნო წელს.
5. სახელმწიფო დღესასწაულები: საქართველოს სახელმწიფო დღესასწაულები ყოველწლიურ შვებულებას ემატება.`,
            },
        ],
    });
    console.log('✅ Policies created (createMany)');

    // HR templates (createMany)
    await prisma.hRTemplate.createMany({
        skipDuplicates: true,
        data: [
            {
                slug: 'hr-audit-checklist',
                title: 'HR Audit Checklist Template',
                content: `HR Audit Checklist Template
[Insert full HR Audit Checklist content here — paste your long template content.]`,
            },
            {
                slug: 'employee-development-plan',
                title: 'Employee Development Plan Template',
                content: `Employee Development Plan Template
[Insert full Employee Development Plan content here.]`,
            },
            {
                slug: 'competency-matrix',
                title: 'Competency Matrix Template',
                content: `Competency Matrix Template
[Insert full Competency Matrix content here.]`,
            },
            {
                slug: 'vacation-tracker',
                title: 'Vacation Tracking Sheet Template',
                content: `Vacation Tracking Sheet Template
[Insert full Vacation Tracker content here.]`,
            },
            {
                slug: 'learning-development-plan',
                title: 'Learning and Development Plan Template',
                content: `Learning & Development Plan Template
[Insert full Learning & Development Plan content here.]`,
            },
            {
                slug: 'policy-update-checklist',
                title: 'HR Policy Update Checklist Template',
                content: `HR Policy Update Checklist Template
[Insert full Policy Update Checklist content here.]`,
            },
        ],
    });
    console.log('✅ HR templates created (createMany)');

    // Training courses (example)
    await prisma.trainingCourse.createMany({
        skipDuplicates: true,
        data: [
            {
                title: 'Effective Communication',
                provider: 'Coursera',
                duration: '4 weeks',
            },
            {
                title: 'Advanced React',
                provider: 'Udemy',
                duration: '6 weeks',
            },
        ],
    });
    console.log('✅ Training courses created (createMany)');
    console.log('🎉 TypeScript seeding finished');
}

seed()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
