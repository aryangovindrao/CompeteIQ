/**
 * Seeds the database with the same demo data the frontend used in mock mode,
 * so the moment you run `npm run db:seed` the app looks fully populated.
 *
 * Demo accounts (all password "demo1234"):
 *   - admin@northwood.edu  → institute_admin
 *   - meera@northwood.edu  → teacher
 *   - aryan@northwood.edu  → student
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const now = Date.now();
const hours = (h: number) => new Date(now + h * 3600_000);
const daysAgo = (d: number) => new Date(now - d * 86400_000);

const STUDENT_NAMES = [
  'Aisha Khan', 'Liam Chen', 'Sofia Garcia', 'Noah Patel', 'Emma Wright', 'Yuki Tanaka',
  'Omar Farouk', 'Mia Rossi', 'Ethan Park', 'Ava Müller', 'Lucas Silva', 'Zara Ahmed',
  'Daniel Kim', 'Chloe Dubois', 'Ravi Sharma', 'Nina Petrov', 'Marco Bianchi', 'Leah Cohen',
  'Tom Becker', 'Isla Murphy', 'Hugo Martin', 'Priya Nair', 'Jack Wilson', 'Fatima Ali',
];

const OTHER_INSTITUTES = [
  { name: 'Riverside School', domain: 'riverside.edu' },
  { name: 'Summit College', domain: 'summit.edu' },
  { name: 'Oakridge Institute', domain: 'oakridge.edu' },
];

async function main() {
  console.log('🌱 Seeding CompeteIQ…');

  // Clear any existing data so reseeds are idempotent.
  await prisma.$transaction([
    prisma.attemptAnswer.deleteMany(),
    prisma.attempt.deleteMany(),
    prisma.certificate.deleteMany(),
    prisma.userBadge.deleteMany(),
    prisma.badge.deleteMany(),
    prisma.questionOption.deleteMany(),
    prisma.question.deleteMany(),
    prisma.activityEvent.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.classEnrollment.deleteMany(),
    prisma.competition.deleteMany(),
    prisma.classRoom.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.user.deleteMany(),
    prisma.institute.deleteMany(),
    prisma.package.deleteMany(),
  ]);

  // ---------- Packages ----------
  const [pkgFree, pkgStarter, pkgPro, pkgEnt] = await Promise.all([
    prisma.package.create({
      data: {
        name: 'free', label: 'Free', priceMonthly: 0, priceAnnual: 0,
        maxCompetitions: 1, maxParticipants: 50, maxTeachers: 1,
        features: ['1 competition', '50 students', '1 teacher', 'Basic leaderboards', 'Community support'],
      },
    }),
    prisma.package.create({
      data: {
        name: 'starter', label: 'Starter', priceMonthly: 19, priceAnnual: 182,
        maxCompetitions: 10, maxParticipants: 500, maxTeachers: 3,
        features: ['10 competitions', '500 students', '3 teachers', 'Live leaderboards', 'Certificates', 'Email support'],
      },
    }),
    prisma.package.create({
      data: {
        name: 'pro', label: 'Pro', priceMonthly: 49, priceAnnual: 470, popular: true,
        maxCompetitions: -1, maxParticipants: -1, maxTeachers: 25,
        features: ['Unlimited competitions', 'Unlimited students', '25 teachers', 'AI question generator', 'Live proctoring', 'Advanced analytics', 'Priority support'],
      },
    }),
    prisma.package.create({
      data: {
        name: 'enterprise', label: 'Enterprise', priceMonthly: -1, priceAnnual: -1,
        maxCompetitions: -1, maxParticipants: -1, maxTeachers: -1,
        features: ['Everything in Pro', 'SSO / SAML', 'API access', 'Dedicated success manager', 'Custom integrations', 'SLA & onboarding'],
      },
    }),
  ]);
  void pkgFree; void pkgStarter; void pkgEnt;

  // ---------- Institutes ----------
  const northwood = await prisma.institute.create({
    data: { name: 'Northwood Academy', domain: 'northwood.edu', plan: 'pro', country: 'United States', createdAt: daysAgo(420) },
  });
  const others = await Promise.all(
    OTHER_INSTITUTES.map((i) =>
      prisma.institute.create({ data: { name: i.name, domain: i.domain, plan: 'free', country: 'United States' } }),
    ),
  );

  // ---------- Subscription + invoices ----------
  await prisma.subscription.create({
    data: {
      instituteId: northwood.id,
      packageId: pkgPro.id,
      planName: 'pro',
      status: 'active',
      validUntil: new Date(now + 45 * 86400_000),
    },
  });
  await prisma.invoice.createMany({
    data: [
      { instituteId: northwood.id, date: daysAgo(5), description: 'Pro plan — monthly', amount: 49, status: 'paid', pdfUrl: '#' },
      { instituteId: northwood.id, date: daysAgo(35), description: 'Pro plan — monthly', amount: 49, status: 'paid', pdfUrl: '#' },
      { instituteId: northwood.id, date: daysAgo(65), description: 'Pro plan — monthly', amount: 49, status: 'paid', pdfUrl: '#' },
      { instituteId: northwood.id, date: daysAgo(95), description: 'Starter plan — monthly', amount: 19, status: 'paid', pdfUrl: '#' },
    ],
  });

  // ---------- Users ----------
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const admin = await prisma.user.create({
    data: {
      instituteId: northwood.id, role: 'institute_admin', email: 'admin@northwood.edu',
      passwordHash, name: 'Rajesh Kapoor', bio: 'Institute administrator at Northwood Academy.',
      xpTotal: 0, tier: 'platinum',
    },
  });
  const meera = await prisma.user.create({
    data: {
      instituteId: northwood.id, role: 'teacher', email: 'meera@northwood.edu',
      passwordHash, name: 'Dr. Meera Nair',
      bio: 'Physics faculty. 12 years teaching. Olympiad coach.',
      xpTotal: 0, tier: 'gold',
    },
  });
  const alan = await prisma.user.create({
    data: {
      instituteId: northwood.id, role: 'teacher', email: 'alan@northwood.edu',
      passwordHash, name: 'Mr. Alan Pierce', bio: 'History faculty.',
      xpTotal: 0, tier: 'gold',
    },
  });
  const lena = await prisma.user.create({
    data: {
      instituteId: northwood.id, role: 'teacher', email: 'lena@northwood.edu',
      passwordHash, name: 'Ms. Lena Ford', bio: 'Chemistry teacher.',
      xpTotal: 0, tier: 'silver',
    },
  });
  const aryan = await prisma.user.create({
    data: {
      instituteId: northwood.id, role: 'student', email: 'aryan@northwood.edu',
      passwordHash, name: 'Aryan Rao',
      bio: 'Aspiring software engineer. Competitive quizzer. Loves physics and algorithms.',
      phone: '+1 (555) 014-2277',
      xpTotal: 3840, streakDays: 7, tier: 'silver', level: 12, xpInLevel: 340, xpForLevel: 500,
    },
  });

  // Pool of students across institutes (Aryan's institute gets the bulk).
  const students = await Promise.all(
    STUDENT_NAMES.map((name, i) => {
      const inst = i < 18 ? northwood : others[(i - 18) % others.length];
      return prisma.user.create({
        data: {
          instituteId: inst.id,
          role: 'student',
          email: `student${i + 1}@${inst.domain}`,
          passwordHash,
          name,
          xpTotal: 3200 - i * 95 + Math.floor(Math.random() * 120),
          streakDays: Math.max(0, 14 - i),
          tier: i < 4 ? 'gold' : i < 12 ? 'silver' : 'bronze',
          createdAt: daysAgo(110 - i * 3),
        },
      });
    }),
  );

  // ---------- Classes ----------
  const csClass = await prisma.classRoom.create({
    data: {
      instituteId: northwood.id, name: 'Computer Science 101', subject: 'Computer Science',
      description: 'Introduction to programming, data structures, and algorithms.',
      teacherId: meera.id, joinCode: 'CS1-40192', avgScore: 81, createdAt: daysAgo(120),
    },
  });
  const physicsClass = await prisma.classRoom.create({
    data: {
      instituteId: northwood.id, name: 'Advanced Physics', subject: 'Physics',
      description: 'Classical mechanics, electromagnetism, and modern physics.',
      teacherId: meera.id, joinCode: 'PHY-22847', avgScore: 74, createdAt: daysAgo(95),
    },
  });
  const historyClass = await prisma.classRoom.create({
    data: {
      instituteId: northwood.id, name: 'World History', subject: 'History',
      description: 'A survey of major civilizations and global events.',
      teacherId: alan.id, joinCode: 'HIS-77310', avgScore: 86, createdAt: daysAgo(60),
    },
  });
  const chemClass = await prisma.classRoom.create({
    data: {
      instituteId: northwood.id, name: 'Organic Chemistry', subject: 'Chemistry',
      description: 'Structure, properties, and reactions of organic compounds.',
      teacherId: lena.id, joinCode: 'CHM-50281', avgScore: 69, createdAt: daysAgo(40),
    },
  });

  // Enroll everyone (Aryan + the 24 students) split roughly across classes.
  const classes = [csClass, physicsClass, historyClass, chemClass];
  const learners = [aryan, ...students.filter((s) => s.instituteId === northwood.id)];
  await prisma.classEnrollment.createMany({
    data: learners.flatMap((u, i) => {
      const homeClass = classes[i % classes.length];
      const out = [{ userId: u.id, classId: homeClass.id, enrolledAt: daysAgo(80 - i) }];
      // ~half of learners join a second class for richer demo data.
      if (i % 2 === 0) {
        out.push({ userId: u.id, classId: classes[(i + 1) % classes.length].id, enrolledAt: daysAgo(50 - i) });
      }
      return out;
    }),
  });

  // ---------- Competitions ----------
  const dsa = await prisma.competition.create({
    data: {
      instituteId: northwood.id, classId: csClass.id, title: 'Data Structures & Algorithms Sprint',
      description: 'A timed sprint covering arrays, trees, sorting and complexity analysis.',
      type: 'mcq', difficulty: 'medium', status: 'live', joinCode: 'DSA-48217',
      startTime: hours(-0.2), endTime: hours(0.75), durationMin: 45,
      maxScore: 75, passThreshold: 60, createdById: meera.id, createdAt: daysAgo(2),
    },
  });
  const newton = await prisma.competition.create({
    data: {
      instituteId: northwood.id, classId: physicsClass.id, title: "Physics: Newton's Laws",
      description: 'Conceptual and numerical questions on classical mechanics.',
      type: 'mixed', difficulty: 'hard', status: 'upcoming', joinCode: 'PHY-90431',
      startTime: hours(26), endTime: hours(27.5), durationMin: 90,
      maxScore: 100, passThreshold: 50, createdById: meera.id, createdAt: daysAgo(1),
    },
  });
  const history = await prisma.competition.create({
    data: {
      instituteId: northwood.id, classId: historyClass.id, title: 'World History Quiz Bowl',
      description: 'From ancient civilizations to the modern era.',
      type: 'mcq', difficulty: 'easy', status: 'ended', joinCode: 'HIS-11052',
      startTime: daysAgo(5), endTime: daysAgo(5), durationMin: 30,
      maxScore: 100, passThreshold: 40, createdById: alan.id, createdAt: daysAgo(9),
    },
  });
  const react = await prisma.competition.create({
    data: {
      instituteId: northwood.id, classId: csClass.id, title: 'React Fundamentals Challenge',
      description: 'Hooks, components, state and rendering.',
      type: 'mcq', difficulty: 'medium', status: 'ended', joinCode: 'RCT-77310',
      startTime: daysAgo(12), endTime: daysAgo(12), durationMin: 40,
      maxScore: 100, passThreshold: 60, createdById: meera.id, createdAt: daysAgo(16),
    },
  });
  await prisma.competition.create({
    data: {
      instituteId: northwood.id, classId: physicsClass.id, title: 'Chemistry: Periodic Trends',
      description: 'Atomic radius, ionization energy, electronegativity.',
      type: 'mcq', difficulty: 'medium', status: 'upcoming', joinCode: 'CHM-32094',
      startTime: hours(50), endTime: hours(51), durationMin: 60,
      maxScore: 90, passThreshold: 55, createdById: lena.id, createdAt: daysAgo(1),
    },
  });
  await prisma.competition.create({
    data: {
      instituteId: northwood.id, classId: historyClass.id, title: 'English Literature: Shakespeare',
      description: 'Plays, sonnets, themes and characters.',
      type: 'subjective', difficulty: 'hard', status: 'ended', joinCode: 'ENG-55218',
      startTime: daysAgo(20), endTime: daysAgo(20), durationMin: 75,
      maxScore: 100, passThreshold: 50, createdById: alan.id, createdAt: daysAgo(25),
    },
  });
  void chemClass;

  // ---------- Questions (attached to the DSA competition) ----------
  type QSeed = {
    type: 'mcq' | 'true_false' | 'short';
    content: string;
    marks: number;
    options?: { id: string; text: string }[];
    correctOptionId?: string;
    correctAnswer?: string;
    explanation: string;
  };

  const dsaQuestions: QSeed[] = [
    {
      type: 'mcq', marks: 10,
      content: 'What is the time complexity of binary search on a sorted array of n elements?',
      options: [
        { id: 'a', text: 'O(n)' }, { id: 'b', text: 'O(log n)' },
        { id: 'c', text: 'O(n log n)' }, { id: 'd', text: 'O(1)' },
      ],
      correctOptionId: 'b',
      explanation: 'Binary search halves the search space each step, giving logarithmic time.',
    },
    {
      type: 'mcq', marks: 10,
      content: 'Which data structure uses FIFO (First In, First Out) ordering?',
      options: [
        { id: 'a', text: 'Stack' }, { id: 'b', text: 'Queue' },
        { id: 'c', text: 'Tree' }, { id: 'd', text: 'Graph' },
      ],
      correctOptionId: 'b',
      explanation: 'A queue processes elements in the order they were added.',
    },
    {
      type: 'true_false', marks: 5,
      content: 'A hash table guarantees O(1) lookup in the worst case.',
      options: [
        { id: 'true', text: 'True' }, { id: 'false', text: 'False' },
      ],
      correctOptionId: 'false',
      explanation: 'Worst-case lookup is O(n) due to collisions; O(1) is the average case.',
    },
    {
      type: 'mcq', marks: 10,
      content: 'Which sorting algorithm has the best average-case time complexity?',
      options: [
        { id: 'a', text: 'Bubble Sort' }, { id: 'b', text: 'Insertion Sort' },
        { id: 'c', text: 'Merge Sort' }, { id: 'd', text: 'Selection Sort' },
      ],
      correctOptionId: 'c',
      explanation: 'Merge sort runs in O(n log n) on average and worst case.',
    },
    {
      type: 'short', marks: 15,
      content: 'In one sentence, explain what a recursive function is.',
      correctAnswer: 'A function that calls itself to solve smaller instances of a problem.',
      explanation: 'Recursion solves a problem by reducing it to smaller subproblems until a base case is reached.',
    },
    {
      type: 'mcq', marks: 10,
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
      type: 'true_false', marks: 5,
      content: 'In React, state updates are always synchronous.',
      options: [
        { id: 'true', text: 'True' }, { id: 'false', text: 'False' },
      ],
      correctOptionId: 'false',
      explanation: 'React batches and applies state updates asynchronously.',
    },
    {
      type: 'mcq', marks: 10,
      content: 'Which keyword declares a block-scoped variable in JavaScript?',
      options: [
        { id: 'a', text: 'var' }, { id: 'b', text: 'let' },
        { id: 'c', text: 'function' }, { id: 'd', text: 'global' },
      ],
      correctOptionId: 'b',
      explanation: '`let` (and `const`) are block-scoped; `var` is function-scoped.',
    },
  ];

  for (let i = 0; i < dsaQuestions.length; i++) {
    const q = dsaQuestions[i];
    await prisma.question.create({
      data: {
        competitionId: dsa.id,
        type: q.type,
        content: q.content,
        marks: q.marks,
        order: i + 1,
        correctOptionId: q.correctOptionId,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: q.options
          ? {
              create: q.options.map((o: { id: string; text: string }) => ({
                id: `${i + 1}-${o.id}`,
                text: o.text,
              })),
            }
          : undefined,
      },
    });
  }

  // Also seed a smaller question set for the React competition (ended).
  const reactQs: QSeed[] = [
    {
      type: 'mcq', marks: 10,
      content: 'Which hook lets you run side effects after render?',
      options: [
        { id: 'a', text: 'useState' }, { id: 'b', text: 'useEffect' },
        { id: 'c', text: 'useMemo' }, { id: 'd', text: 'useRef' },
      ],
      correctOptionId: 'b',
      explanation: 'useEffect runs after the DOM is updated.',
    },
    {
      type: 'mcq', marks: 10,
      content: 'What does useMemo do?',
      options: [
        { id: 'a', text: 'Memoizes a value' }, { id: 'b', text: 'Replaces useState' },
        { id: 'c', text: 'Schedules an effect' }, { id: 'd', text: 'Triggers re-render' },
      ],
      correctOptionId: 'a',
      explanation: 'useMemo caches a computed value across renders.',
    },
  ];
  for (let i = 0; i < reactQs.length; i++) {
    const q = reactQs[i];
    await prisma.question.create({
      data: {
        competitionId: react.id,
        type: q.type,
        content: q.content,
        marks: q.marks,
        order: i + 1,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
        options: {
          create: q.options!.map((o: { id: string; text: string }) => ({
            id: `r${i + 1}-${o.id}`,
            text: o.text,
          })),
        },
      },
    });
  }

  // ---------- Badges ----------
  const badgeData = [
    { slug: 'first-steps', name: 'First Steps', description: 'Completed your first competition', condition: 'Complete 1 competition', icon: '🎯', tier: 'bronze' as const, xpReward: 50 },
    { slug: 'perfect-score', name: 'Perfect Score', description: 'Scored 100% in a competition', condition: 'Score 100%', icon: '💯', tier: 'gold' as const, xpReward: 200 },
    { slug: 'speed-demon', name: 'Speed Demon', description: 'Finished in under half the time', condition: 'Finish in < 50% time', icon: '⚡', tier: 'silver' as const, xpReward: 120 },
    { slug: 'streak-master', name: 'Streak Master', description: '7-day participation streak', condition: '7-day streak', icon: '🔥', tier: 'silver' as const, xpReward: 100 },
    { slug: 'top-of-class', name: 'Top of the Class', description: 'Ranked #1 in a competition', condition: 'Rank #1', icon: '👑', tier: 'gold' as const, xpReward: 250 },
    { slug: 'scholar', name: 'Scholar', description: 'Earned 10 certificates', condition: '10 certificates', icon: '📜', tier: 'platinum' as const, xpReward: 400 },
    { slug: 'sharp-shooter', name: 'Sharp Shooter', description: '5 competitions above 90%', condition: '5× score > 90%', icon: '🎖️', tier: 'gold' as const, xpReward: 180 },
    { slug: 'marathoner', name: 'Marathoner', description: '30-day streak', condition: '30-day streak', icon: '🏃', tier: 'platinum' as const, xpReward: 500 },
  ];
  const badges = await Promise.all(badgeData.map((b) => prisma.badge.create({ data: b })));
  const byBadgeSlug = new Map(badges.map((b) => [b.slug, b]));

  // Award Aryan 4 badges (matches the original mock UI).
  for (const slug of ['first-steps', 'perfect-score', 'speed-demon', 'streak-master']) {
    await prisma.userBadge.create({
      data: { userId: aryan.id, badgeId: byBadgeSlug.get(slug)!.id, awardedAt: daysAgo(9) },
    });
  }

  // ---------- Aryan's prior attempts + certificates + activity ----------
  await prisma.attempt.create({
    data: {
      userId: aryan.id, competitionId: history.id,
      score: 88, maxScore: 100, percentage: 88, passed: true,
      rank: 12, totalParticipants: 312, timeTakenSec: 1180, xpEarned: 176,
      submittedAt: daysAgo(5),
    },
  });
  await prisma.attempt.create({
    data: {
      userId: aryan.id, competitionId: react.id,
      score: 95, maxScore: 100, percentage: 95, passed: true,
      rank: 3, totalParticipants: 198, timeTakenSec: 1420, xpEarned: 190,
      submittedAt: daysAgo(12),
    },
  });

  await prisma.certificate.createMany({
    data: [
      { userId: aryan.id, competitionId: react.id, score: 95, rank: 3, pdfUrl: 'https://example.com/cert-1.pdf', isPublic: true, issuedAt: daysAgo(12) },
      { userId: aryan.id, competitionId: history.id, score: 88, rank: 12, pdfUrl: 'https://example.com/cert-2.pdf', isPublic: false, issuedAt: daysAgo(5) },
    ],
  });

  await prisma.activityEvent.createMany({
    data: [
      { userId: aryan.id, type: 'score', text: 'Scored 72% in Data Structures & Algorithms Sprint', createdAt: daysAgo(0) },
      { userId: aryan.id, type: 'badge', text: "Earned the 'Streak Master' badge", createdAt: daysAgo(1) },
      { userId: aryan.id, type: 'join', text: 'Joined Advanced Physics class', createdAt: daysAgo(3) },
      { userId: aryan.id, type: 'certificate', text: 'Received a certificate for World History Quiz Bowl', createdAt: daysAgo(5) },
      { userId: aryan.id, type: 'score', text: 'Scored 88% in World History Quiz Bowl', createdAt: daysAgo(5) },
      { userId: aryan.id, type: 'score', text: 'Scored 95% in React Fundamentals Challenge', createdAt: daysAgo(12) },
      { userId: aryan.id, type: 'badge', text: "Earned the 'Speed Demon' badge", createdAt: daysAgo(12) },
    ],
  });

  // ---------- Notifications ----------
  await prisma.notification.createMany({
    data: [
      { userId: aryan.id, title: 'Competition is live', body: 'Data Structures Sprint just started.', read: false, type: 'success', createdAt: daysAgo(0) },
      { userId: aryan.id, title: 'New badge earned', body: "You earned 'Streak Master'.", read: false, type: 'info', createdAt: daysAgo(1) },
      { userId: aryan.id, title: 'Certificate ready', body: 'Your World History certificate is ready.', read: true, type: 'info', createdAt: daysAgo(5) },
    ],
  });

  console.log('✅ Seed complete.\n');
  console.log('   Sign in with any of:');
  console.log('     admin@northwood.edu   (institute admin)');
  console.log('     meera@northwood.edu   (teacher)');
  console.log('     aryan@northwood.edu   (student)');
  console.log('   Password: demo1234\n');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
