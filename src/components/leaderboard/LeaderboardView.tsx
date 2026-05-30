'use client';

import { useState } from 'react';
import { Crown, Flame, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/types';
import { useLeaderboard } from '@/lib/hooks';
import { cn, formatNumber } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard';
import { Avatar } from '@/components/ui/Avatar';
import { PillTabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { Panel } from '@/components/dashboard';

const podiumColor = ['#D4A017', '#9CA3AF', '#CD7F32'];

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: 0 | 1 | 2 }) {
  const color = podiumColor[place];
  const heights = ['h-32', 'h-24', 'h-20'];
  const order = ['order-2', 'order-1', 'order-3'];
  return (
    <div className={cn('flex flex-col items-center', order[place])}>
      <div className="relative">
        {place === 0 && <Crown size={20} className="absolute -top-6 left-1/2 -translate-x-1/2 text-[#D4A017]" />}
        <Avatar
          name={entry.name}
          src={entry.avatarUrl}
          size={place === 0 ? 'xl' : 'lg'}
          className="ring-4"
        />
        <span
          className="absolute -bottom-1 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {entry.rank}
        </span>
      </div>
      <p className="mt-3 max-w-[8rem] truncate text-center text-sm font-semibold text-text-primary">
        {entry.name}
      </p>
      <p className="text-xs text-text-muted">{formatNumber(entry.xpTotal)} XP</p>
      <div
        className={cn('mt-3 w-24 rounded-t-lg', heights[place])}
        style={{ background: `linear-gradient(to top, ${color}33, ${color}0D)` }}
      />
    </div>
  );
}

function Row({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        entry.isCurrentUser && 'bg-primary-light',
      )}
    >
      <span className="w-8 text-center text-sm font-semibold text-text-muted">{entry.rank}</span>
      <Avatar name={entry.name} src={entry.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {entry.name}
          {entry.isCurrentUser && <span className="ml-1.5 text-xs text-primary">You</span>}
        </p>
        <p className="truncate text-xs text-text-muted">{entry.instituteName}</p>
      </div>
      <span className="hidden items-center gap-1 text-xs text-text-secondary sm:flex">
        <Medal size={13} className="text-text-muted" /> {entry.badgeCount}
      </span>
      <span className="hidden items-center gap-1 text-xs text-text-secondary sm:flex">
        <Flame size={13} className="text-warning" /> {entry.streakDays}
      </span>
      <span className="w-24 text-right text-sm font-semibold text-text-primary">
        {formatNumber(entry.xpTotal)} XP
      </span>
    </div>
  );
}

export function LeaderboardView() {
  const [scope, setScope] = useState<'institute' | 'global'>('global');
  const { data: rows, isLoading } = useLeaderboard(scope);

  const top3 = (rows ?? []).slice(0, 3);
  const rest = (rows ?? []).slice(3);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        subtitle="See how you stack up against your peers across the platform."
        actions={
          <PillTabs
            value={scope}
            onChange={(v) => setScope(v as 'institute' | 'global')}
            items={[
              { value: 'global', label: 'Global' },
              { value: 'institute', label: 'My institute' },
            ]}
          />
        }
      />

      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : top3.length === 3 ? (
        <div className="rounded-xl border border-border bg-white p-6 pt-10 shadow-card">
          <div className="flex items-end justify-center gap-4 sm:gap-8">
            <PodiumCard entry={top3[1]} place={1} />
            <PodiumCard entry={top3[0]} place={0} />
            <PodiumCard entry={top3[2]} place={2} />
          </div>
        </div>
      ) : null}

      <Panel title="Full ranking" bodyClassName="p-0">
        {isLoading ? (
          <div className="space-y-1 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rest.map((e) => (
              <Row key={e.userId} entry={e} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
