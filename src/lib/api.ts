import axios, { AxiosError } from 'axios';
import type {
  ActivityEvent,
  Attempt,
  AnswerInput,
  AuthResponse,
  Certificate,
  ClassRoom,
  ClassStudent,
  Competition,
  GeneratedQuestion,
  Invoice,
  JoinPreview,
  LeaderboardEntry,
  Package,
  Question,
  Role,
  SkillPoint,
  StatCard,
  Subscription,
  User,
} from './types';
import {
  mockActivityFeed,
  mockAdmin,
  mockAdminStats,
  mockAttempts,
  mockBadges,
  mockCertificates,
  mockClasses,
  mockClassStudents,
  mockCompetitions,
  mockInvoices,
  mockLeaderboard,
  mockPackages,
  mockQuestions,
  mockSkills,
  mockStudentStats,
  mockSubscription,
  mockTeacher,
  mockTeacherStats,
  mockUser,
  mockUserBadges,
} from './mock';
import { generateJoinCode, sleep } from './utils';

/**
 * Flip USE_MOCKS=true to bypass the real backend and use bundled fixture data.
 * Defaults to FALSE — real backend is the production path.
 */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
const TOKEN_KEY = 'competeiq_token';
const USER_KEY = 'competeiq_user';

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    // Mirror to a cookie so the Next.js middleware can guard routes.
    document.cookie = `${TOKEN_KEY}=${t}; path=/; max-age=2592000; samesite=lax`;
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
  },
};

export const userStore = {
  get: (): User | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },
  set: (u: User) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => localStorage.removeItem(USER_KEY),
};

/**
 * Default baseURL is empty so requests hit `/api/...` on the same Next.js
 * origin. Set NEXT_PUBLIC_API_URL only if you split the backend onto a
 * different domain.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      tokenStore.clear();
      userStore.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

function pickUserByRole(role: Role): User {
  if (role === 'teacher') return mockTeacher;
  if (role === 'institute_admin') return mockAdmin;
  return mockUser;
}

// --- Demo-role state (only used by the mock branch) ---
let demoRole: Role = 'student';
export function setDemoRole(role: Role) {
  demoRole = role;
}
export function getCurrentMockUser(): User {
  return pickUserByRole(demoRole);
}

/* ----------------------------- AUTH ----------------------------- */
export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCKS) {
      await sleep(500);
      if (!email || password.length < 4) throw new Error('Invalid email or password');
      const role: Role = email.startsWith('admin')
        ? 'institute_admin'
        : email.startsWith('teacher') || email.startsWith('meera')
          ? 'teacher'
          : 'student';
      setDemoRole(role);
      return { token: `mock.${role}.${Date.now()}`, user: { ...pickUserByRole(role), email } };
    }
    const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
    return data;
  },

  async register(payload: {
    instituteName: string;
    domain: string;
    country: string;
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    if (USE_MOCKS) {
      await sleep(700);
      setDemoRole('institute_admin');
      return {
        token: `mock.admin.${Date.now()}`,
        user: { ...mockAdmin, name: payload.name, email: payload.email, instituteName: payload.instituteName },
      };
    }
    const { data } = await api.post<AuthResponse>('/api/auth/register', payload);
    return data;
  },

  async me(): Promise<User> {
    if (USE_MOCKS) {
      await sleep(150);
      return getCurrentMockUser();
    }
    const { data } = await api.get<User>('/api/auth/me');
    return data;
  },

  async forgotPassword(email: string): Promise<{ sent: boolean }> {
    if (USE_MOCKS) {
      await sleep(500);
      return { sent: true };
    }
    const { data } = await api.post('/api/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(otp: string, password: string): Promise<{ ok: boolean }> {
    if (USE_MOCKS) {
      await sleep(500);
      return { ok: otp.length === 6 };
    }
    const { data } = await api.post('/api/auth/reset-password', { otp, password });
    return data;
  },

  async joinWithCode(code: string): Promise<JoinPreview> {
    if (USE_MOCKS) {
      await sleep(400);
      const comp = mockCompetitions.find((c) => c.joinCode === code.toUpperCase());
      if (comp) {
        return {
          kind: 'competition', id: comp.id, name: comp.title,
          teacherName: comp.createdBy, instituteName: comp.instituteName, when: comp.startTime,
        };
      }
      const cls = mockClasses.find((c) => c.joinCode === code.toUpperCase());
      if (cls) {
        return {
          kind: 'class', id: cls.id, name: cls.name,
          teacherName: cls.teacherName, instituteName: 'Northwood Academy',
        };
      }
      const fallback = mockCompetitions[0];
      return {
        kind: 'competition', id: fallback.id, name: fallback.title,
        teacherName: fallback.createdBy, instituteName: fallback.instituteName, when: fallback.startTime,
      };
    }
    const { data } = await api.get<JoinPreview>(`/api/auth/join/${encodeURIComponent(code)}`);
    return data;
  },
};

/* -------------------------- COMPETITIONS ------------------------- */
export const competitionsApi = {
  async list(): Promise<Competition[]> {
    if (USE_MOCKS) { await sleep(350); return mockCompetitions; }
    const { data } = await api.get<Competition[]>('/api/competitions');
    return data;
  },
  async get(id: string): Promise<Competition> {
    if (USE_MOCKS) { await sleep(250); return mockCompetitions.find((c) => c.id === id) ?? mockCompetitions[0]; }
    const { data } = await api.get<Competition>(`/api/competitions/${id}`);
    return data;
  },
  async questions(id: string): Promise<Question[]> {
    if (USE_MOCKS) { await sleep(300); return mockQuestions.map((q) => ({ ...q, competitionId: id })); }
    const { data } = await api.get<Question[]>(`/api/competitions/${id}/questions`);
    return data;
  },
  async submit(id: string, answers: AnswerInput[]): Promise<Attempt> {
    if (USE_MOCKS) {
      await sleep(700);
      const questions = mockQuestions;
      let score = 0; let max = 0;
      for (const q of questions) {
        max += q.marks;
        const a = answers.find((x) => x.questionId === q.id);
        if (!a) continue;
        if (q.type === 'short' || q.type === 'long') {
          if (a.text && a.text.trim().length > 8) score += Math.round(q.marks * 0.8);
        } else if (a.optionId && a.optionId === q.correctOptionId) score += q.marks;
      }
      const percentage = Math.round((score / max) * 100);
      const passed = percentage >= 60;
      return {
        id: `att-${Date.now()}`, userId: mockUser.id, userName: mockUser.name,
        competitionId: id,
        competitionTitle: mockCompetitions.find((c) => c.id === id)?.title ?? 'Competition',
        score, maxScore: max, percentage, passed, rank: 3, totalParticipants: 215,
        timeTakenSec: 1180, xpEarned: Math.round(percentage * 1.5),
        submittedAt: new Date().toISOString(),
        newBadges: passed ? [mockBadges[2], mockBadges[6]] : [],
        answers: questions.map((q) => {
          const a = answers.find((x) => x.questionId === q.id);
          const correct =
            q.type === 'short' || q.type === 'long'
              ? !!(a?.text && a.text.trim().length > 8)
              : a?.optionId === q.correctOptionId;
          return {
            questionId: q.id, optionId: a?.optionId, text: a?.text, correct,
            correctOptionId: q.correctOptionId, correctAnswer: q.correctAnswer,
            explanation: q.explanation, marksAwarded: correct ? q.marks : 0,
          };
        }),
      };
    }
    const { data } = await api.post<Attempt>(`/api/competitions/${id}/submit`, { answers });
    return data;
  },
  async result(id: string): Promise<Attempt> {
    if (USE_MOCKS) {
      await sleep(300);
      const existing = mockAttempts.find((a) => a.competitionId === id);
      if (existing) {
        return {
          ...existing,
          answers: mockQuestions.map((q) => ({
            questionId: q.id, optionId: q.correctOptionId,
            correct: Math.random() > 0.25,
            correctOptionId: q.correctOptionId, correctAnswer: q.correctAnswer,
            explanation: q.explanation, marksAwarded: q.marks,
          })),
          newBadges: [mockBadges[2]],
        };
      }
      return competitionsApi.submit(id, []);
    }
    const { data } = await api.get<Attempt>(`/api/competitions/${id}/result`);
    return data;
  },
  async leaderboard(id: string): Promise<LeaderboardEntry[]> {
    if (USE_MOCKS) {
      await sleep(250);
      return mockLeaderboard.slice(0, 10).map((r) => ({ ...r, score: 100 - r.rank * 3, timeTakenSec: 600 + r.rank * 25 }));
    }
    const { data } = await api.get<LeaderboardEntry[]>(`/api/competitions/${id}/leaderboard`);
    return data;
  },
};

/* ----------------------------- CLASSES --------------------------- */
export const classesApi = {
  async list(): Promise<ClassRoom[]> {
    if (USE_MOCKS) { await sleep(300); return mockClasses; }
    const { data } = await api.get<ClassRoom[]>('/api/classes');
    return data;
  },
  async get(id: string): Promise<ClassRoom> {
    if (USE_MOCKS) { await sleep(250); return mockClasses.find((c) => c.id === id) ?? mockClasses[0]; }
    const { data } = await api.get<ClassRoom>(`/api/classes/${id}`);
    return data;
  },
  async students(id: string): Promise<ClassStudent[]> {
    if (USE_MOCKS) { await sleep(300); return mockClassStudents; }
    const { data } = await api.get<ClassStudent[]>(`/api/classes/${id}/students`);
    return data;
  },
  async create(payload: { name: string; subject: string; description: string }): Promise<ClassRoom> {
    if (USE_MOCKS) {
      await sleep(500);
      return {
        id: `class-${Date.now()}`, instituteId: 'inst-1',
        name: payload.name, subject: payload.subject, description: payload.description,
        teacherId: mockTeacher.id, teacherName: mockTeacher.name, joinCode: generateJoinCode(),
        studentCount: 0, activeCompetitions: 0, avgScore: 0,
        createdAt: new Date().toISOString(),
      };
    }
    const { data } = await api.post<ClassRoom>('/api/classes', payload);
    return data;
  },
  async leaderboard(id: string): Promise<LeaderboardEntry[]> {
    if (USE_MOCKS) { await sleep(250); return mockLeaderboard.slice(0, 20); }
    const { data } = await api.get<LeaderboardEntry[]>(`/api/classes/${id}/leaderboard`);
    return data;
  },
};

/* ----------------------------- PROFILE --------------------------- */
export const profileApi = {
  async get(userId?: string): Promise<User> {
    if (USE_MOCKS) {
      await sleep(250);
      return userId && userId !== mockUser.id ? { ...mockUser, id: userId, name: 'Sofia Garcia' } : getCurrentMockUser();
    }
    const { data } = await api.get<User>(userId ? `/api/users/${userId}` : '/api/profile');
    return data;
  },
  async update(payload: Partial<User>): Promise<User> {
    if (USE_MOCKS) { await sleep(500); return { ...getCurrentMockUser(), ...payload }; }
    const { data } = await api.patch<User>('/api/profile', payload);
    return data;
  },
  async badges(): Promise<typeof mockUserBadges> {
    if (USE_MOCKS) { await sleep(250); return mockUserBadges; }
    const { data } = await api.get('/api/profile/badges');
    return data;
  },
  async certificates(): Promise<Certificate[]> {
    if (USE_MOCKS) { await sleep(250); return mockCertificates; }
    const { data } = await api.get<Certificate[]>('/api/profile/certificates');
    return data;
  },
  async skills(): Promise<SkillPoint[]> {
    if (USE_MOCKS) { await sleep(150); return mockSkills; }
    const { data } = await api.get<SkillPoint[]>('/api/profile/skills');
    return data;
  },
  async activity(): Promise<ActivityEvent[]> {
    if (USE_MOCKS) { await sleep(150); return mockActivityFeed; }
    const { data } = await api.get<ActivityEvent[]>('/api/profile/activity');
    return data;
  },
};

/* --------------------------- LEADERBOARD ------------------------- */
export const leaderboardApi = {
  async get(scope: 'institute' | 'global'): Promise<LeaderboardEntry[]> {
    if (USE_MOCKS) {
      await sleep(300);
      if (scope === 'institute') {
        return mockLeaderboard
          .filter((r) => r.instituteName === 'Northwood Academy')
          .map((r, i) => ({ ...r, rank: i + 1 }));
      }
      return mockLeaderboard;
    }
    const { data } = await api.get<LeaderboardEntry[]>(`/api/leaderboard?scope=${scope}`);
    return data;
  },
};

/* ----------------------------- BILLING --------------------------- */
export const billingApi = {
  async subscription(): Promise<Subscription> {
    if (USE_MOCKS) { await sleep(250); return mockSubscription; }
    const { data } = await api.get<Subscription>('/api/billing/subscription');
    return data;
  },
  async packages(): Promise<Package[]> {
    if (USE_MOCKS) { await sleep(150); return mockPackages; }
    const { data } = await api.get<Package[]>('/api/billing/packages');
    return data;
  },
  async invoices(): Promise<Invoice[]> {
    if (USE_MOCKS) { await sleep(250); return mockInvoices; }
    const { data } = await api.get<Invoice[]>('/api/billing/invoices');
    return data;
  },
  async portalUrl(): Promise<string> {
    if (USE_MOCKS) { await sleep(300); return 'https://billing.stripe.com/p/session/test'; }
    const { data } = await api.post<{ url: string }>('/api/billing/portal');
    return data.url;
  },
  async checkout(plan: 'starter' | 'pro', billing: 'monthly' | 'annual'): Promise<string> {
    if (USE_MOCKS) { await sleep(300); return 'https://checkout.stripe.com/c/pay/test'; }
    const { data } = await api.post<{ url: string }>('/api/billing/checkout', { plan, billing });
    return data.url;
  },
};

/* --------------------------- DASHBOARD --------------------------- */
export const dashboardApi = {
  async stats(role: Role): Promise<StatCard[]> {
    if (USE_MOCKS) {
      await sleep(300);
      if (role === 'teacher') return mockTeacherStats;
      if (role === 'institute_admin') return mockAdminStats;
      return mockStudentStats;
    }
    const { data } = await api.get<StatCard[]>(`/api/dashboard/stats?role=${role}`);
    return data;
  },
};

/* ----------------------------- UPLOADS --------------------------- */
export const uploadsApi = {
  /**
   * Two-step upload: ask the server for a presigned URL, then PUT the file
   * directly to R2. Returns the public URL of the stored object.
   */
  async upload(kind: 'avatar' | 'syllabus', file: File, onProgress?: (p: number) => void): Promise<{ publicUrl: string; key: string }> {
    if (USE_MOCKS) {
      for (let p = 0; p <= 100; p += 20) {
        await sleep(80);
        onProgress?.(p);
      }
      return { publicUrl: URL.createObjectURL(file), key: `mock/${file.name}` };
    }
    const { data: presign } = await api.post<{ uploadUrl: string; key: string; publicUrl: string }>(
      '/api/uploads/presign',
      { kind, filename: file.name, contentType: file.type, size: file.size },
    );
    // Direct PUT to R2 — bypasses our server entirely.
    const xhr = new XMLHttpRequest();
    await new Promise<void>((resolve, reject) => {
      xhr.open('PUT', presign.uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(file);
    });
    return { publicUrl: presign.publicUrl, key: presign.key };
  },
};

/* -------------------------- AI GENERATOR ------------------------- */
export const aiApi = {
  async generate(payload: {
    topic: string;
    count: number;
    difficulty: string;
    type: string;
  }): Promise<GeneratedQuestion[]> {
    if (USE_MOCKS) {
      await sleep(1300);
      return Array.from({ length: payload.count }, (_, i) => {
        const isTF = payload.type === 'true_false' || (payload.type === 'mixed' && i % 3 === 0);
        if (isTF) {
          return {
            id: `gen-${i}`,
            type: 'true_false' as const,
            content: `True or False: ${payload.topic} is governed by an inverse-square relationship. (Q${i + 1})`,
            options: [
              { id: 'true', text: 'True' },
              { id: 'false', text: 'False' },
            ],
            correctOptionId: i % 2 === 0 ? 'true' : 'false',
            marks: 5,
            explanation: `This statement about ${payload.topic} is ${i % 2 === 0 ? 'correct' : 'a common misconception'}.`,
          };
        }
        return {
          id: `gen-${i}`,
          type: 'mcq' as const,
          content: `Which statement best describes a key principle of ${payload.topic}? (Q${i + 1})`,
          options: [
            { id: 'a', text: `${payload.topic} option A — distractor` },
            { id: 'b', text: `${payload.topic} option B — the correct principle` },
            { id: 'c', text: `${payload.topic} option C — distractor` },
            { id: 'd', text: `${payload.topic} option D — distractor` },
          ],
          correctOptionId: 'b',
          marks: 10,
          explanation: `Option B correctly captures the core idea of ${payload.topic}.`,
        };
      });
    }
    const { data } = await api.post<GeneratedQuestion[]>('/api/ai/generate', payload);
    return data;
  },
  async uploadSyllabus(file: File, onProgress?: (p: number) => void): Promise<{ chunks: number; filename: string }> {
    if (USE_MOCKS) {
      for (let p = 0; p <= 100; p += 10) {
        await sleep(120);
        onProgress?.(p);
      }
      return { chunks: 142, filename: file.name };
    }
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/api/ai/syllabus', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
      },
    });
    return data;
  },
};
