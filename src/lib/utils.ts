import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNowStrict, differenceInSeconds } from 'date-fns';

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Initials from a full name, e.g. "Aryan Rao" -> "AR". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Deterministic HSL color from a string (avatars, subject chips). */
export function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

/** Format an ISO date string. */
export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  try {
    return format(new Date(date), fmt);
  } catch {
    return '—';
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "MMM d, yyyy · h:mm a");
}

export function relativeTime(date: string | Date): string {
  try {
    return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
  } catch {
    return '—';
  }
}

/** Compact number formatting: 12000 -> "12,000". */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatCurrency(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Seconds -> "12m 34s" / "1h 05m". */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

/** Mm:ss for live timers. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Countdown breakdown to a target date. */
export function countdownTo(target: string | Date): {
  total: number;
  label: string;
  expired: boolean;
} {
  const total = differenceInSeconds(new Date(target), new Date());
  if (total <= 0) return { total: 0, label: 'now', expired: true };
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  let label: string;
  if (d > 0) label = `${d}d ${h}h ${m}m`;
  else if (h > 0) label = `${h}h ${m}m ${s}s`;
  else label = `${m}m ${s}s`;
  return { total, label, expired: false };
}

/** Generate a join code like "ABC-12345". */
export function generateJoinCode(): string {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join('');
  const digits = String(Math.floor(10000 + Math.random() * 90000));
  return `${letters}-${digits}`;
}

/** Normalize a user-typed code: uppercase, strip junk, keep A-Z0-9. */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

/** Copy text to clipboard with a graceful fallback. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}

/** Password strength: 0 weak, 1 fair, 2 good, 3 strong. */
export function passwordStrength(pw: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: 'Too weak', color: '#EF4444' },
    { label: 'Weak', color: '#F59E0B' },
    { label: 'Good', color: '#10B981' },
    { label: 'Strong', color: '#059669' },
  ] as const;
  const s = Math.min(score, 3) as 0 | 1 | 2 | 3;
  return { score: s, ...map[s] };
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Async sleep used by mock API + animations. */
export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export const subjectIconColor: Record<string, string> = {
  Math: '#2563EB',
  Mathematics: '#2563EB',
  Science: '#10B981',
  Physics: '#7C3AED',
  Chemistry: '#DB2777',
  Biology: '#059669',
  English: '#F59E0B',
  History: '#92400E',
  Coding: '#0EA5E9',
  'Computer Science': '#0EA5E9',
  Geography: '#0D9488',
};
