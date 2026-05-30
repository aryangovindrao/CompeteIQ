'use client';

import { Flame, Sparkles, Zap } from 'lucide-react';
import type { User } from '@/lib/types';
import { useCountUp } from '@/lib/hooks';
import { CircularProgress } from '@/components/ui/Progress';
import { tierMeta } from './Badges';

export function XpProgressCard({ user }: { user: User }) {
  const xp = useCountUp(user.xpTotal);
  const meta = tierMeta[user.tier];
  const toNext = Math.max(user.xpForLevel - user.xpInLevel, 0);

  return (
    <div className="relative overflow-hidden rounded-xl bg-dark p-6 text-white shadow-card">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="ui-label text-white/50">My Progress</p>
          <h3 className="mt-1 text-lg font-semibold">Level {user.level}</h3>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: meta.tint, color: meta.hex }}
        >
          <Sparkles size={12} /> {meta.label}
        </span>
      </div>

      <div className="relative mt-5 flex items-center gap-6">
        <CircularProgress
          value={user.xpInLevel}
          max={user.xpForLevel}
          size={120}
          stroke={10}
          trackClass="text-white/10"
          fillClass="text-primary"
        >
          <span className="text-2xl font-bold leading-none">{user.level}</span>
          <span className="mt-0.5 text-[11px] text-white/50">Level</span>
        </CircularProgress>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-white/60">
              <Zap size={15} className="text-primary" />
              <span className="text-xs">Total XP</span>
            </div>
            <p className="mt-0.5 text-2xl font-bold tabular-nums">{xp.toLocaleString()}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-white/60">
              <Flame size={15} className="text-warning" />
              <span className="text-xs">Current streak</span>
            </div>
            <p className="mt-0.5 text-2xl font-bold">
              {user.streakDays} <span className="text-base font-medium text-white/50">days</span>
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-1.5 flex justify-between text-xs text-white/50">
          <span>{user.xpInLevel} / {user.xpForLevel} XP</span>
          <span>{toNext} XP to Level {user.level + 1}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-700"
            style={{ width: `${Math.min((user.xpInLevel / user.xpForLevel) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
