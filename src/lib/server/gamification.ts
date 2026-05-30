/**
 * Domain helpers — keep XP/level/tier math in one place.
 */

import type { BadgeTier } from '@prisma/client';

const LEVEL_XP = 500;

export function levelFromXp(xp: number) {
  const level = Math.max(1, Math.floor(xp / LEVEL_XP) + 1);
  const xpInLevel = xp % LEVEL_XP;
  return { level, xpInLevel, xpForLevel: LEVEL_XP };
}

export function tierFromXp(xp: number): BadgeTier {
  if (xp >= 8000) return 'platinum';
  if (xp >= 4000) return 'gold';
  if (xp >= 1500) return 'silver';
  return 'bronze';
}

export function xpFromAttempt(percentage: number) {
  return Math.round(percentage * 1.5);
}

/** Generate a join code like "ABC-12345" (server-side; utils.ts is client-only safe). */
export function generateJoinCode(): string {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join('');
  const digits = String(Math.floor(10000 + Math.random() * 90000));
  return `${letters}-${digits}`;
}
