/**
 * Convert Prisma rows into the shape the frontend expects (matches src/lib/types.ts).
 * These keep the existing UI working unchanged.
 */

import type {
  Attempt as PAttempt,
  AttemptAnswer as PAttemptAnswer,
  Badge as PBadge,
  Certificate as PCertificate,
  ClassEnrollment as PEnrollment,
  ClassRoom as PClass,
  Competition as PComp,
  Institute as PInst,
  Invoice as PInvoice,
  Package as PPackage,
  Question as PQuestion,
  QuestionOption as PQuestionOption,
  Subscription as PSubscription,
  User as PUser,
  UserBadge as PUserBadge,
} from '@prisma/client';

import type {
  Attempt,
  AttemptAnswer,
  Badge,
  Certificate,
  ClassRoom,
  Competition,
  CompetitionStatus,
  Invoice,
  Package,
  Question,
  Subscription,
  User,
  UserBadge,
} from '@/lib/types';

// ---------------------------------------------------------------------------

export function serializeUser(u: PUser & { institute?: PInst | null }): User {
  return {
    id: u.id,
    instituteId: u.instituteId,
    instituteName: u.institute?.name,
    role: u.role,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl ?? undefined,
    bio: u.bio ?? undefined,
    phone: u.phone ?? undefined,
    xpTotal: u.xpTotal,
    streakDays: u.streakDays,
    tier: u.tier,
    level: u.level,
    xpInLevel: u.xpInLevel,
    xpForLevel: u.xpForLevel,
    createdAt: u.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------

export function liveStatus(c: PComp): CompetitionStatus {
  const now = Date.now();
  const start = c.startTime.getTime();
  const end = c.endTime.getTime();
  if (c.status === 'draft') return 'draft';
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
}

export function serializeCompetition(
  c: PComp & {
    institute?: { name: string } | null;
    createdBy?: { name: string } | null;
    _count?: { questions?: number; attempts?: number };
    attempts?: PAttempt[];
  },
  viewerId?: string,
): Competition {
  const viewerAttempt = c.attempts?.find((a) => a.userId === viewerId);
  return {
    id: c.id,
    instituteId: c.instituteId,
    instituteName: c.institute?.name ?? '',
    classId: c.classId ?? undefined,
    title: c.title,
    description: c.description ?? undefined,
    type: c.type,
    difficulty: c.difficulty,
    status: liveStatus(c),
    joinCode: c.joinCode,
    startTime: c.startTime.toISOString(),
    endTime: c.endTime.toISOString(),
    durationMin: c.durationMin,
    questionCount: c._count?.questions ?? 0,
    maxScore: c.maxScore,
    passThreshold: c.passThreshold,
    participantCount: c._count?.attempts ?? 0,
    createdBy: c.createdBy?.name ?? '',
    createdAt: c.createdAt.toISOString(),
    joined: !!viewerAttempt || undefined,
    attemptId: viewerAttempt?.id,
  };
}

// ---------------------------------------------------------------------------

export function serializeQuestion(
  q: PQuestion & { options?: PQuestionOption[] },
  reveal = false,
): Question {
  return {
    id: q.id,
    competitionId: q.competitionId,
    type: q.type,
    content: q.content,
    options: q.options?.map((o) => ({ id: o.id, text: o.text })),
    correctOptionId: reveal ? q.correctOptionId ?? undefined : undefined,
    correctAnswer: reveal ? q.correctAnswer ?? undefined : undefined,
    marks: q.marks,
    explanation: reveal ? q.explanation ?? undefined : undefined,
    order: q.order,
  };
}

// ---------------------------------------------------------------------------

export function serializeAttempt(
  a: PAttempt & {
    competition?: { title: string } | null;
    user?: { name: string } | null;
    answers?: (PAttemptAnswer & { question: PQuestion })[];
  },
  newBadges?: Badge[],
): Attempt {
  return {
    id: a.id,
    userId: a.userId,
    userName: a.user?.name ?? '',
    competitionId: a.competitionId,
    competitionTitle: a.competition?.title ?? '',
    score: a.score,
    maxScore: a.maxScore,
    percentage: a.percentage,
    passed: a.passed,
    rank: a.rank,
    totalParticipants: a.totalParticipants,
    timeTakenSec: a.timeTakenSec,
    xpEarned: a.xpEarned,
    submittedAt: a.submittedAt.toISOString(),
    answers: a.answers?.map<AttemptAnswer>((ans) => ({
      questionId: ans.questionId,
      optionId: ans.optionId ?? undefined,
      text: ans.text ?? undefined,
      correct: ans.correct,
      correctOptionId: ans.question.correctOptionId ?? undefined,
      correctAnswer: ans.question.correctAnswer ?? undefined,
      explanation: ans.question.explanation ?? undefined,
      marksAwarded: ans.marksAwarded,
    })),
    newBadges,
  };
}

// ---------------------------------------------------------------------------

export function serializeClass(
  c: PClass & {
    teacher?: { name: string } | null;
    _count?: { enrollments?: number; competitions?: number };
  },
): ClassRoom {
  return {
    id: c.id,
    instituteId: c.instituteId,
    name: c.name,
    subject: c.subject,
    description: c.description ?? undefined,
    teacherId: c.teacherId,
    teacherName: c.teacher?.name ?? '',
    joinCode: c.joinCode,
    studentCount: c._count?.enrollments ?? 0,
    activeCompetitions: c._count?.competitions ?? 0,
    avgScore: c.avgScore,
    createdAt: c.createdAt.toISOString(),
  };
}

export function serializeClassStudent(e: PEnrollment & { user: PUser }) {
  return {
    id: e.user.id,
    name: e.user.name,
    email: e.user.email,
    avatarUrl: e.user.avatarUrl ?? undefined,
    xpTotal: e.user.xpTotal,
    enrolledAt: e.enrolledAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------

export function serializeBadge(b: PBadge): Badge {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    condition: b.condition,
    icon: b.icon,
    tier: b.tier,
    xpReward: b.xpReward,
  };
}

export function serializeUserBadge(b: PUserBadge & { badge: PBadge }): UserBadge {
  return {
    ...serializeBadge(b.badge),
    awardedAt: b.awardedAt.toISOString(),
    earned: true,
  };
}

// ---------------------------------------------------------------------------

export function serializeCertificate(
  c: PCertificate & { competition: { title: string }; user: { name: string } },
): Certificate {
  return {
    id: c.id,
    userId: c.userId,
    userName: c.user.name,
    competitionId: c.competitionId,
    competitionTitle: c.competition.title,
    score: c.score,
    rank: c.rank,
    pdfUrl: c.pdfUrl,
    isPublic: c.isPublic,
    issuedAt: c.issuedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------

export function serializePackage(p: PPackage): Package {
  return {
    id: p.id,
    name: p.name,
    label: p.label,
    priceMonthly: p.priceMonthly,
    priceAnnual: p.priceAnnual,
    maxCompetitions: p.maxCompetitions,
    maxParticipants: p.maxParticipants,
    maxTeachers: p.maxTeachers,
    features: p.features,
    popular: p.popular || undefined,
  };
}

export function serializeSubscription(
  s: PSubscription,
  usage: {
    competitionsUsed: number;
    competitionsLimit: number;
    teachersUsed: number;
    teachersLimit: number;
    studentsUsed: number;
  },
): Subscription {
  const daysRemaining = Math.max(
    0,
    Math.ceil((s.validUntil.getTime() - Date.now()) / 86400_000),
  );
  return {
    id: s.id,
    instituteId: s.instituteId,
    packageId: s.packageId,
    planName: s.planName,
    status: s.status,
    validUntil: s.validUntil.toISOString(),
    daysRemaining,
    usage,
  };
}

export function serializeInvoice(i: PInvoice): Invoice {
  return {
    id: i.id,
    date: i.date.toISOString(),
    description: i.description,
    amount: i.amount,
    status: i.status,
    pdfUrl: i.pdfUrl,
  };
}
