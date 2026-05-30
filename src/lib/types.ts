/**
 * Domain types for CompeteIQ.
 * Derived from the platform ERD (institutes, users, competitions, questions,
 * attempts, badges, certificates, packages, subscriptions).
 */

export type UUID = string;
export type ISODate = string;

export type Role = 'student' | 'teacher' | 'institute_admin';

export type CompetitionType = 'mcq' | 'coding' | 'subjective' | 'mixed';
export type CompetitionStatus = 'draft' | 'upcoming' | 'live' | 'ended';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'true_false' | 'short' | 'long' | 'coding';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled';
export type PlanName = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Institute {
  id: UUID;
  name: string;
  domain: string;
  plan: PlanName;
  country?: string;
  studentCount?: number;
  teacherCount?: number;
  createdAt: ISODate;
}

export interface User {
  id: UUID;
  instituteId: UUID;
  instituteName?: string;
  role: Role;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  xpTotal: number;
  streakDays: number;
  tier: BadgeTier;
  level: number;
  xpInLevel: number;
  xpForLevel: number;
  createdAt: ISODate;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: UUID;
  competitionId: UUID;
  type: QuestionType;
  content: string;
  options?: QuestionOption[];
  correctOptionId?: string;
  correctAnswer?: string;
  marks: number;
  explanation?: string;
  order: number;
}

export interface Competition {
  id: UUID;
  instituteId: UUID;
  instituteName: string;
  classId?: UUID;
  title: string;
  description?: string;
  type: CompetitionType;
  difficulty: Difficulty;
  status: CompetitionStatus;
  joinCode: string;
  startTime: ISODate;
  endTime: ISODate;
  durationMin: number;
  questionCount: number;
  maxScore: number;
  passThreshold: number;
  participantCount: number;
  createdBy: string;
  createdAt: ISODate;
  joined?: boolean;
  attemptId?: UUID;
}

export interface AnswerInput {
  questionId: UUID;
  optionId?: string;
  text?: string;
}

export interface AttemptAnswer extends AnswerInput {
  correct: boolean;
  correctOptionId?: string;
  correctAnswer?: string;
  explanation?: string;
  marksAwarded: number;
}

export interface Attempt {
  id: UUID;
  userId: UUID;
  userName: string;
  competitionId: UUID;
  competitionTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  rank: number;
  totalParticipants: number;
  timeTakenSec: number;
  xpEarned: number;
  submittedAt: ISODate;
  answers?: AttemptAnswer[];
  newBadges?: Badge[];
}

export interface Badge {
  id: UUID;
  name: string;
  description: string;
  condition: string;
  icon: string; // emoji or icon key
  tier: BadgeTier;
  xpReward: number;
}

export interface UserBadge extends Badge {
  awardedAt: ISODate;
  earned: boolean;
}

export interface Certificate {
  id: UUID;
  userId: UUID;
  userName: string;
  competitionId: UUID;
  competitionTitle: string;
  score: number;
  rank: number;
  pdfUrl: string;
  isPublic: boolean;
  issuedAt: ISODate;
}

export interface ClassRoom {
  id: UUID;
  instituteId: UUID;
  name: string;
  subject: string;
  description?: string;
  teacherId: UUID;
  teacherName: string;
  joinCode: string;
  studentCount: number;
  activeCompetitions: number;
  avgScore: number;
  createdAt: ISODate;
}

export interface ClassStudent {
  id: UUID;
  name: string;
  email: string;
  avatarUrl?: string;
  xpTotal: number;
  enrolledAt: ISODate;
}

export interface LeaderboardEntry {
  rank: number;
  userId: UUID;
  name: string;
  avatarUrl?: string;
  instituteName: string;
  xpTotal: number;
  badgeCount: number;
  streakDays: number;
  score?: number;
  timeTakenSec?: number;
  lastActive?: ISODate;
  isCurrentUser?: boolean;
}

export interface Package {
  id: UUID;
  name: PlanName;
  label: string;
  priceMonthly: number;
  priceAnnual: number;
  maxCompetitions: number; // -1 = unlimited
  maxParticipants: number;
  maxTeachers: number;
  features: string[];
  popular?: boolean;
}

export interface Subscription {
  id: UUID;
  instituteId: UUID;
  packageId: UUID;
  planName: PlanName;
  status: SubscriptionStatus;
  validUntil: ISODate;
  daysRemaining: number;
  usage: {
    competitionsUsed: number;
    competitionsLimit: number;
    teachersUsed: number;
    teachersLimit: number;
    studentsUsed: number;
  };
}

export interface Invoice {
  id: UUID;
  date: ISODate;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  pdfUrl: string;
}

export interface ActivityPoint {
  day: string;
  value: number;
  target: number;
}

export interface SparkPoint {
  value: number;
}

export interface StatCard {
  label: string;
  value: string;
  trend: number; // percent, can be negative
  spark: SparkPoint[];
}

export interface SkillPoint {
  subject: string;
  score: number;
  fullMark: number;
}

export interface ActivityEvent {
  id: string;
  date: ISODate;
  type: 'score' | 'badge' | 'join' | 'certificate';
  text: string;
}

export interface ScoreBucket {
  range: string;
  count: number;
}

export interface GeneratedQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options?: QuestionOption[];
  correctOptionId?: string;
  correctAnswer?: string;
  marks: number;
  explanation: string;
}

export interface JoinPreview {
  kind: 'competition' | 'class';
  id: UUID;
  name: string;
  teacherName: string;
  instituteName: string;
  when?: ISODate;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: ISODate;
  type: 'info' | 'success' | 'warning';
}
