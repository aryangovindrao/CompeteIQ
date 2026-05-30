'use client';

import { CalendarDays, Flame, Medal, ScrollText, Sparkles, Zap } from 'lucide-react';
import type { Role, User } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { tierMeta } from '@/components/dashboard';

const roleLabel: Record<Role, string> = {
  student: 'Student',
  teacher: 'Teacher',
  institute_admin: 'Institute Admin',
};

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-secondary">
        {icon}
      </span>
      <div>
        <p className="text-base font-bold leading-none text-text-primary">{value}</p>
        <p className="mt-0.5 text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

export function ProfileHeader({
  user,
  badgesEarned,
  certificatesCount,
  actions,
}: {
  user: User;
  badgesEarned: number;
  certificatesCount: number;
  actions?: React.ReactNode;
}) {
  const meta = tierMeta[user.tier];
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-card">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={user.name} src={user.avatarUrl} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">{user.name}</h1>
            <Badge tone="primary">{roleLabel[user.role]}</Badge>
          </div>
          {user.instituteName && (
            <p className="mt-1 text-sm text-text-secondary">{user.instituteName}</p>
          )}
          {user.bio && <p className="mt-2 max-w-xl text-sm text-text-secondary">{user.bio}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold"
              style={{ backgroundColor: meta.tint, color: meta.hex }}
            >
              <Sparkles size={12} /> {meta.label} · Level {user.level}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-text-secondary">
              <CalendarDays size={12} /> Joined {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
        <Stat icon={<Zap size={17} />} label="Total XP" value={formatNumber(user.xpTotal)} />
        <Stat icon={<Flame size={17} />} label="Day streak" value={`${user.streakDays}`} />
        <Stat icon={<Medal size={17} />} label="Badges earned" value={`${badgesEarned}`} />
        <Stat icon={<ScrollText size={17} />} label="Certificates" value={`${certificatesCount}`} />
      </div>
    </div>
  );
}
