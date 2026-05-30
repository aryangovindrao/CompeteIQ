import type {
  ActivityEvent,
  ActivityPoint,
  Attempt,
  Badge,
  Certificate,
  ClassRoom,
  ClassStudent,
  Competition,
  Institute,
  Invoice,
  LeaderboardEntry,
  Notification,
  Package,
  Question,
  ScoreBucket,
  SkillPoint,
  StatCard,
  Subscription,
  User,
  UserBadge,
} from './types';

const now = Date.now();
const hours = (h: number) => new Date(now + h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400_000).toISOString();

export const mockInstitute: Institute = {
  id: 'inst-1',
  name: 'Northwood Academy',
  domain: 'northwood.edu',
  plan: 'pro',
  country: 'United States',
  studentCount: 1240,
  teacherCount: 18,
  createdAt: daysAgo(420),
};

export const mockUser: User = {
  id: 'user-1',
  instituteId: 'inst-1',
  instituteName: 'Northwood Academy',
  role: 'student',
  email: 'aryan@northwood.edu',
  name: 'Aryan Rao',
  bio: 'Aspiring software engineer. Competitive quizzer. Loves physics and algorithms.',
  phone: '+1 (555) 014-2277',
  xpTotal: 3840,
  streakDays: 7,
  tier: 'silver',
  level: 12,
  xpInLevel: 340,
  xpForLevel: 500,
  createdAt: daysAgo(180),
};

export const mockTeacher: User = {
  ...mockUser,
  id: 'user-t1',
  role: 'teacher',
  name: 'Dr. Meera Nair',
  email: 'meera@northwood.edu',
  bio: 'Physics faculty. 12 years teaching. Olympiad coach.',
  xpTotal: 0,
  tier: 'gold',
};

export const mockAdmin: User = {
  ...mockUser,
  id: 'user-a1',
  role: 'institute_admin',
  name: 'Rajesh Kapoor',
  email: 'admin@northwood.edu',
  bio: 'Institute administrator at Northwood Academy.',
  tier: 'platinum',
};

export const mockBadges: Badge[] = [
  { id: 'b1', name: 'First Steps', description: 'Completed your first competition', condition: 'Complete 1 competition', icon: '🎯', tier: 'bronze', xpReward: 50 },
  { id: 'b2', name: 'Perfect Score', description: 'Scored 100% in a competition', condition: 'Score 100%', icon: '💯', tier: 'gold', xpReward: 200 },
  { id: 'b3', name: 'Speed Demon', description: 'Finished in under half the time', condition: 'Finish in < 50% time', icon: '⚡', tier: 'silver', xpReward: 120 },
  { id: 'b4', name: 'Streak Master', description: '7-day participation streak', condition: '7-day streak', icon: '🔥', tier: 'silver', xpReward: 100 },
  { id: 'b5', name: 'Top of the Class', description: 'Ranked #1 in a competition', condition: 'Rank #1', icon: '👑', tier: 'gold', xpReward: 250 },
  { id: 'b6', name: 'Scholar', description: 'Earned 10 certificates', condition: '10 certificates', icon: '📜', tier: 'platinum', xpReward: 400 },
  { id: 'b7', name: 'Sharp Shooter', description: '5 competitions above 90%', condition: '5× score > 90%', icon: '🎖️', tier: 'gold', xpReward: 180 },
  { id: 'b8', name: 'Marathoner', description: '30-day streak', condition: '30-day streak', icon: '🏃', tier: 'platinum', xpReward: 500 },
];

export const mockUserBadges: UserBadge[] = mockBadges.map((b, i) => ({
  ...b,
  earned: i < 4,
  awardedAt: i < 4 ? daysAgo(i * 9 + 2) : '',
}));

export const mockQuestions: Question[] = [
  {
    id: 'q1', competitionId: 'comp-1', type: 'mcq', order: 1, marks: 10,
    content: 'What is the time complexity of binary search on a sorted array of n elements?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(log n)' },
      { id: 'c', text: 'O(n log n)' },
      { id: 'd', text: 'O(1)' },
    ],
    correctOptionId: 'b',
    explanation: 'Binary search halves the search space each step, giving logarithmic time.',
  },
  {
    id: 'q2', competitionId: 'comp-1', type: 'mcq', order: 2, marks: 10,
    content: 'Which data structure uses FIFO (First In, First Out) ordering?',
    options: [
      { id: 'a', text: 'Stack' },
      { id: 'b', text: 'Queue' },
      { id: 'c', text: 'Tree' },
      { id: 'd', text: 'Graph' },
    ],
    correctOptionId: 'b',
    explanation: 'A queue processes elements in the order they were added.',
  },
  {
    id: 'q3', competitionId: 'comp-1', type: 'true_false', order: 3, marks: 5,
    content: 'A hash table guarantees O(1) lookup in the worst case.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctOptionId: 'false',
    explanation: 'Worst-case lookup is O(n) due to collisions; O(1) is the average case.',
  },
  {
    id: 'q4', competitionId: 'comp-1', type: 'mcq', order: 4, marks: 10,
    content: 'Which sorting algorithm has the best average-case time complexity?',
    options: [
      { id: 'a', text: 'Bubble Sort' },
      { id: 'b', text: 'Insertion Sort' },
      { id: 'c', text: 'Merge Sort' },
      { id: 'd', text: 'Selection Sort' },
    ],
    correctOptionId: 'c',
    explanation: 'Merge sort runs in O(n log n) on average and worst case.',
  },
  {
    id: 'q5', competitionId: 'comp-1', type: 'short', order: 5, marks: 15,
    content: 'In one sentence, explain what a recursive function is.',
    correctAnswer: 'A function that calls itself to solve smaller instances of a problem.',
    explanation: 'Recursion solves a problem by reducing it to smaller subproblems until a base case is reached.',
  },
  {
    id: 'q6', competitionId: 'comp-1', type: 'mcq', order: 6, marks: 10,
    content: 'What does the acronym API stand for?',
    options: [
      { id: 'a', text: 'Application Programming Interface' },
      { id: 'b', text: 'Applied Process Integration' },
      { id: 'c', text: 'Automated Program Input' },
      { id: 'd', text: 'Advanced Protocol Implementation' },
    ],
    correctOptionId: 'a',
    explanation: 'API = Application Programming Interface.',
  },
  {
    id: 'q7', competitionId: 'comp-1', type: 'true_false', order: 7, marks: 5,
    content: 'In React, state updates are always synchronous.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctOptionId: 'false',
    explanation: 'React batches and applies state updates asynchronously.',
  },
  {
    id: 'q8', competitionId: 'comp-1', type: 'mcq', order: 8, marks: 10,
    content: 'Which keyword declares a block-scoped variable in JavaScript?',
    options: [
      { id: 'a', text: 'var' },
      { id: 'b', text: 'let' },
      { id: 'c', text: 'function' },
      { id: 'd', text: 'global' },
    ],
    correctOptionId: 'b',
    explanation: '`let` (and `const`) are block-scoped; `var` is function-scoped.',
  },
];

export const mockCompetitions: Competition[] = [
  {
    id: 'comp-1', instituteId: 'inst-1', instituteName: 'Northwood Academy', classId: 'class-1',
    title: 'Data Structures & Algorithms Sprint', description: 'A timed sprint covering arrays, trees, sorting and complexity analysis.',
    type: 'mcq', difficulty: 'medium', status: 'live', joinCode: 'DSA-48217',
    startTime: hours(-0.2), endTime: hours(0.75), durationMin: 45, questionCount: 8,
    maxScore: 75, passThreshold: 60, participantCount: 215, createdBy: 'Dr. Meera Nair',
    createdAt: daysAgo(2), joined: true,
  },
  {
    id: 'comp-2', instituteId: 'inst-1', instituteName: 'Northwood Academy', classId: 'class-2',
    title: "Physics: Newton's Laws", description: 'Conceptual and numerical questions on classical mechanics.',
    type: 'mixed', difficulty: 'hard', status: 'upcoming', joinCode: 'PHY-90431',
    startTime: hours(26), endTime: hours(27.5), durationMin: 90, questionCount: 20,
    maxScore: 100, passThreshold: 50, participantCount: 88, createdBy: 'Dr. Meera Nair',
    createdAt: daysAgo(1),
  },
  {
    id: 'comp-3', instituteId: 'inst-1', instituteName: 'Northwood Academy', classId: 'class-3',
    title: 'World History Quiz Bowl', description: 'From ancient civilizations to the modern era.',
    type: 'mcq', difficulty: 'easy', status: 'ended', joinCode: 'HIS-11052',
    startTime: daysAgo(5), endTime: daysAgo(5), durationMin: 30, questionCount: 25,
    maxScore: 100, passThreshold: 40, participantCount: 312, createdBy: 'Mr. Alan Pierce',
    createdAt: daysAgo(9), joined: true, attemptId: 'att-3',
  },
  {
    id: 'comp-4', instituteId: 'inst-1', instituteName: 'Northwood Academy', classId: 'class-1',
    title: 'React Fundamentals Challenge', description: 'Hooks, components, state and rendering.',
    type: 'mcq', difficulty: 'medium', status: 'ended', joinCode: 'RCT-77310',
    startTime: daysAgo(12), endTime: daysAgo(12), durationMin: 40, questionCount: 15,
    maxScore: 100, passThreshold: 60, participantCount: 198, createdBy: 'Dr. Meera Nair',
    createdAt: daysAgo(16), joined: true, attemptId: 'att-4',
  },
  {
    id: 'comp-5', instituteId: 'inst-1', instituteName: 'Northwood Academy', classId: 'class-2',
    title: 'Chemistry: Periodic Trends', description: 'Atomic radius, ionization energy, electronegativity.',
    type: 'mcq', difficulty: 'medium', status: 'upcoming', joinCode: 'CHM-32094',
    startTime: hours(50), endTime: hours(51), durationMin: 60, questionCount: 18,
    maxScore: 90, passThreshold: 55, participantCount: 41, createdBy: 'Ms. Lena Ford',
    createdAt: daysAgo(1),
  },
  {
    id: 'comp-6', instituteId: 'inst-1', instituteName: 'Northwood Academy', classId: 'class-3',
    title: 'English Literature: Shakespeare', description: 'Plays, sonnets, themes and characters.',
    type: 'subjective', difficulty: 'hard', status: 'ended', joinCode: 'ENG-55218',
    startTime: daysAgo(20), endTime: daysAgo(20), durationMin: 75, questionCount: 10,
    maxScore: 100, passThreshold: 50, participantCount: 134, createdBy: 'Mr. Alan Pierce',
    createdAt: daysAgo(25),
  },
];

export const mockAttempts: Attempt[] = [
  {
    id: 'att-3', userId: 'user-1', userName: 'Aryan Rao', competitionId: 'comp-3',
    competitionTitle: 'World History Quiz Bowl', score: 88, maxScore: 100, percentage: 88,
    passed: true, rank: 12, totalParticipants: 312, timeTakenSec: 1180, xpEarned: 176,
    submittedAt: daysAgo(5),
  },
  {
    id: 'att-4', userId: 'user-1', userName: 'Aryan Rao', competitionId: 'comp-4',
    competitionTitle: 'React Fundamentals Challenge', score: 95, maxScore: 100, percentage: 95,
    passed: true, rank: 3, totalParticipants: 198, timeTakenSec: 1420, xpEarned: 190,
    submittedAt: daysAgo(12),
  },
];

export const mockResultsList = [
  { id: 'r1', title: 'Theory Test 1', score: 95, passed: true, competitionId: 'comp-4' },
  { id: 'r2', title: 'Road Signs Quiz', score: 88, passed: true, competitionId: 'comp-3' },
  { id: 'r3', title: 'Algorithms Sprint', score: 72, passed: true, competitionId: 'comp-1' },
  { id: 'r4', title: 'Mock Exam 1', score: 78, passed: true, competitionId: 'comp-2' },
  { id: 'r5', title: 'Hazard Perception', score: 45, passed: false, competitionId: 'comp-6' },
];

export const mockCertificates: Certificate[] = [
  {
    id: 'cert-1', userId: 'user-1', userName: 'Aryan Rao', competitionId: 'comp-4',
    competitionTitle: 'React Fundamentals Challenge', score: 95, rank: 3,
    pdfUrl: 'https://example.com/certificates/cert-1.pdf', isPublic: true, issuedAt: daysAgo(12),
  },
  {
    id: 'cert-2', userId: 'user-1', userName: 'Aryan Rao', competitionId: 'comp-3',
    competitionTitle: 'World History Quiz Bowl', score: 88, rank: 12,
    pdfUrl: 'https://example.com/certificates/cert-2.pdf', isPublic: false, issuedAt: daysAgo(5),
  },
  {
    id: 'cert-3', userId: 'user-1', userName: 'Aryan Rao', competitionId: 'comp-7',
    competitionTitle: 'Math Olympiad Round 1', score: 91, rank: 5,
    pdfUrl: 'https://example.com/certificates/cert-3.pdf', isPublic: true, issuedAt: daysAgo(30),
  },
];

export const mockClasses: ClassRoom[] = [
  {
    id: 'class-1', instituteId: 'inst-1', name: 'Computer Science 101', subject: 'Computer Science',
    description: 'Introduction to programming, data structures, and algorithms.',
    teacherId: 'user-t1', teacherName: 'Dr. Meera Nair', joinCode: 'CS1-40192',
    studentCount: 64, activeCompetitions: 2, avgScore: 81, createdAt: daysAgo(120),
  },
  {
    id: 'class-2', instituteId: 'inst-1', name: 'Advanced Physics', subject: 'Physics',
    description: 'Classical mechanics, electromagnetism, and modern physics.',
    teacherId: 'user-t1', teacherName: 'Dr. Meera Nair', joinCode: 'PHY-22847',
    studentCount: 48, activeCompetitions: 1, avgScore: 74, createdAt: daysAgo(95),
  },
  {
    id: 'class-3', instituteId: 'inst-1', name: 'World History', subject: 'History',
    description: 'A survey of major civilizations and global events.',
    teacherId: 'user-t2', teacherName: 'Mr. Alan Pierce', joinCode: 'HIS-77310',
    studentCount: 72, activeCompetitions: 0, avgScore: 86, createdAt: daysAgo(60),
  },
  {
    id: 'class-4', instituteId: 'inst-1', name: 'Organic Chemistry', subject: 'Chemistry',
    description: 'Structure, properties, and reactions of organic compounds.',
    teacherId: 'user-t3', teacherName: 'Ms. Lena Ford', joinCode: 'CHM-50281',
    studentCount: 39, activeCompetitions: 1, avgScore: 69, createdAt: daysAgo(40),
  },
];

export const mockClassStudents: ClassStudent[] = Array.from({ length: 24 }, (_, i) => ({
  id: `cs-${i}`,
  name: [
    'Aisha Khan', 'Liam Chen', 'Sofia Garcia', 'Noah Patel', 'Emma Wright', 'Yuki Tanaka',
    'Omar Farouk', 'Mia Rossi', 'Ethan Park', 'Ava Müller', 'Lucas Silva', 'Zara Ahmed',
    'Daniel Kim', 'Chloe Dubois', 'Ravi Sharma', 'Nina Petrov', 'Marco Bianchi', 'Leah Cohen',
    'Tom Becker', 'Isla Murphy', 'Hugo Martin', 'Priya Nair', 'Jack Wilson', 'Fatima Ali',
  ][i],
  email: `student${i + 1}@northwood.edu`,
  xpTotal: 3200 - i * 95 + Math.floor(Math.random() * 120),
  enrolledAt: daysAgo(110 - i * 3),
}));

export const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: 50 }, (_, i) => {
  const names = mockClassStudents.map((s) => s.name);
  const institutes = ['Northwood Academy', 'Riverside School', 'Summit College', 'Oakridge Institute'];
  return {
    rank: i + 1,
    userId: `lb-${i}`,
    name: i === 2 ? 'Aryan Rao' : names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
    instituteName: institutes[i % institutes.length],
    xpTotal: 9800 - i * 165,
    badgeCount: Math.max(1, 9 - Math.floor(i / 4)),
    streakDays: Math.max(0, 31 - i),
    lastActive: daysAgo(Math.floor(i / 6)),
    isCurrentUser: i === 2,
  };
});

export const mockPackages: Package[] = [
  {
    id: 'pkg-free', name: 'free', label: 'Free', priceMonthly: 0, priceAnnual: 0,
    maxCompetitions: 1, maxParticipants: 50, maxTeachers: 1,
    features: ['1 competition', '50 students', '1 teacher', 'Basic leaderboards', 'Community support'],
  },
  {
    id: 'pkg-starter', name: 'starter', label: 'Starter', priceMonthly: 19, priceAnnual: 182,
    maxCompetitions: 10, maxParticipants: 500, maxTeachers: 3,
    features: ['10 competitions', '500 students', '3 teachers', 'Live leaderboards', 'Certificates', 'Email support'],
  },
  {
    id: 'pkg-pro', name: 'pro', label: 'Pro', priceMonthly: 49, priceAnnual: 470, popular: true,
    maxCompetitions: -1, maxParticipants: -1, maxTeachers: 25,
    features: ['Unlimited competitions', 'Unlimited students', '25 teachers', 'AI question generator', 'Live proctoring', 'Advanced analytics', 'Priority support'],
  },
  {
    id: 'pkg-ent', name: 'enterprise', label: 'Enterprise', priceMonthly: -1, priceAnnual: -1,
    maxCompetitions: -1, maxParticipants: -1, maxTeachers: -1,
    features: ['Everything in Pro', 'SSO / SAML', 'API access', 'Dedicated success manager', 'Custom integrations', 'SLA & onboarding'],
  },
];

export const mockSubscription: Subscription = {
  id: 'sub-1', instituteId: 'inst-1', packageId: 'pkg-pro', planName: 'pro', status: 'active',
  validUntil: new Date(now + 45 * 86400_000).toISOString(), daysRemaining: 45,
  usage: { competitionsUsed: 7, competitionsLimit: -1, teachersUsed: 18, teachersLimit: 25, studentsUsed: 1240 },
};

export const mockInvoices: Invoice[] = [
  { id: 'inv-1', date: daysAgo(5), description: 'Pro plan — monthly', amount: 49, status: 'paid', pdfUrl: '#' },
  { id: 'inv-2', date: daysAgo(35), description: 'Pro plan — monthly', amount: 49, status: 'paid', pdfUrl: '#' },
  { id: 'inv-3', date: daysAgo(65), description: 'Pro plan — monthly', amount: 49, status: 'paid', pdfUrl: '#' },
  { id: 'inv-4', date: daysAgo(95), description: 'Starter plan — monthly', amount: 19, status: 'paid', pdfUrl: '#' },
];

const spark = (seed: number[]): { value: number }[] => seed.map((value) => ({ value }));

export const mockStudentStats: StatCard[] = [
  { label: 'Total Attempts', value: '215', trend: 34, spark: spark([8, 12, 9, 15, 11, 18, 21]) },
  { label: 'Completed Classes', value: '4', trend: 12, spark: spark([1, 1, 2, 2, 3, 3, 4]) },
  { label: 'Avg Test Score', value: '85%', trend: 16, spark: spark([72, 75, 78, 74, 80, 83, 85]) },
];

export const mockTeacherStats: StatCard[] = [
  { label: 'Classes Created', value: '6', trend: 20, spark: spark([1, 2, 2, 3, 4, 5, 6]) },
  { label: 'Competitions Hosted', value: '24', trend: 18, spark: spark([2, 4, 6, 9, 14, 19, 24]) },
  { label: 'Total Students', value: '223', trend: 9, spark: spark([120, 150, 170, 185, 200, 215, 223]) },
  { label: 'Avg Pass Rate', value: '78%', trend: 6, spark: spark([70, 72, 71, 74, 76, 77, 78]) },
];

export const mockAdminStats: StatCard[] = [
  { label: 'Teachers', value: '18', trend: 12, spark: spark([8, 10, 11, 13, 15, 17, 18]) },
  { label: 'Students', value: '1,240', trend: 22, spark: spark([800, 900, 980, 1050, 1130, 1200, 1240]) },
  { label: 'Competitions', value: '142', trend: 31, spark: spark([40, 60, 80, 100, 118, 132, 142]) },
  { label: 'Pass Rate', value: '81%', trend: 4, spark: spark([76, 77, 78, 79, 80, 80, 81]) },
];

export const mockActivity: ActivityPoint[] = [
  { day: 'Mon', value: 2.1, target: 2.5 },
  { day: 'Tue', value: 3.2, target: 2.5 },
  { day: 'Wed', value: 1.8, target: 2.5 },
  { day: 'Thu', value: 3.6, target: 2.5 },
  { day: 'Fri', value: 2.9, target: 2.5 },
  { day: 'Sat', value: 4.1, target: 2.5 },
  { day: 'Sun', value: 2.0, target: 2.5 },
];

export const mockSkills: SkillPoint[] = [
  { subject: 'Math', score: 88, fullMark: 100 },
  { subject: 'Science', score: 76, fullMark: 100 },
  { subject: 'English', score: 92, fullMark: 100 },
  { subject: 'History', score: 70, fullMark: 100 },
  { subject: 'Coding', score: 95, fullMark: 100 },
];

export const mockScoreDistribution: ScoreBucket[] = [
  { range: '0–20', count: 4 },
  { range: '21–40', count: 11 },
  { range: '41–60', count: 28 },
  { range: '61–80', count: 64 },
  { range: '81–100', count: 39 },
];

export const mockActivityFeed: ActivityEvent[] = [
  { id: 'e1', date: daysAgo(0), type: 'score', text: 'Scored 72% in Data Structures & Algorithms Sprint' },
  { id: 'e2', date: daysAgo(1), type: 'badge', text: "Earned the 'Streak Master' badge" },
  { id: 'e3', date: daysAgo(3), type: 'join', text: 'Joined Advanced Physics class' },
  { id: 'e4', date: daysAgo(5), type: 'certificate', text: 'Received a certificate for World History Quiz Bowl' },
  { id: 'e5', date: daysAgo(5), type: 'score', text: 'Scored 88% in World History Quiz Bowl' },
  { id: 'e6', date: daysAgo(12), type: 'score', text: 'Scored 95% in React Fundamentals Challenge' },
  { id: 'e7', date: daysAgo(12), type: 'badge', text: "Earned the 'Speed Demon' badge" },
];

export const mockUpcoming = mockCompetitions.filter((c) => c.status === 'upcoming');

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Competition is live', body: 'Data Structures Sprint just started.', read: false, createdAt: daysAgo(0), type: 'success' as const },
  { id: 'n2', title: 'New badge earned', body: "You earned 'Streak Master'.", read: false, createdAt: daysAgo(1), type: 'info' as const },
  { id: 'n3', title: 'Certificate ready', body: 'Your World History certificate is ready.', read: true, createdAt: daysAgo(5), type: 'info' as const },
];
