'use client';

import Link from 'next/link';
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  CreditCard,
  FileText,
  GraduationCap,
  Plus,
  ScrollText,
  Sparkles,
  Target,
  Ticket,
  Trophy,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityEvent, Competition, Role } from '@/lib/types';
import { countdownTo, formatDateTime, relativeTime } from '@/lib/utils';
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/EmptyState';

interface ResultItem {
  id: string;
  title: string;
  score: number;
  passed: boolean;
  competitionId: string;
}

export function ResultsList({ results }: { results: ResultItem[] }) {
  if (results.length === 0) {
    return <EmptyState icon={<Trophy size={22} />} title="No results yet" description="Your completed competitions will appear here." />;
  }
  return (
    <ul className="space-y-3">
      {results.map((r) => (
        <li key={r.id}>
          <Link
            href={`/competitions/${r.competitionId}/results`}
            className="group flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-surface-2"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-text-primary">{r.title}</p>
                <span className="text-sm font-semibold tabular-nums text-text-primary">{r.score}%</span>
              </div>
              <div className="mt-1.5">
                <Progress value={r.score} size="sm" variant={r.passed ? 'success' : 'danger'} />
              </div>
            </div>
            <Badge tone={r.passed ? 'green' : 'red'}>{r.passed ? 'Passed' : 'Failed'}</Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function UpcomingList({ competitions }: { competitions: Competition[] }) {
  if (competitions.length === 0) {
    return <EmptyState icon={<Calendar size={22} />} title="Nothing scheduled" description="Upcoming competitions will show up here." />;
  }
  return (
    <ul className="space-y-3">
      {competitions.map((c) => {
        const cd = countdownTo(c.startTime);
        return (
          <li key={c.id}>
            <Link
              href={`/competitions/${c.id}`}
              className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-surface-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Trophy size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{c.title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                  <Calendar size={12} /> {formatDateTime(c.startTime)}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <Badge tone="amber" dot>
                  in {cd.label}
                </Badge>
              </div>
              <ChevronRight size={16} className="text-text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

interface ActionItem {
  label: string;
  href: string;
  icon: LucideIcon;
  desc: string;
}

const actionsByRole: Record<Role, ActionItem[]> = {
  student: [
    { label: 'Join with code', href: '/join', icon: Ticket, desc: 'Enter a competition code' },
    { label: 'Browse competitions', href: '/competitions', icon: Trophy, desc: 'Find something to enter' },
    { label: 'Leaderboard', href: '/leaderboard', icon: BarChart3, desc: 'See where you rank' },
    { label: 'My certificates', href: '/certificates', icon: ScrollText, desc: 'Download your wins' },
  ],
  teacher: [
    { label: 'New competition', href: '/competitions', icon: Plus, desc: 'Create a live test' },
    { label: 'AI generator', href: '/ai-generator', icon: Sparkles, desc: 'Build questions fast' },
    { label: 'My classes', href: '/classes', icon: BookOpen, desc: 'Manage your classes' },
    { label: 'Students', href: '/students', icon: Users, desc: 'View your students' },
  ],
  institute_admin: [
    { label: 'Invite teachers', href: '/teachers', icon: UserPlus, desc: 'Grow your faculty' },
    { label: 'All competitions', href: '/competitions', icon: Trophy, desc: 'Institute-wide view' },
    { label: 'Billing & plan', href: '/billing', icon: CreditCard, desc: 'Manage subscription' },
    { label: 'AI generator', href: '/ai-generator', icon: Sparkles, desc: 'Build question banks' },
  ],
};

export function QuickActions({ role }: { role: Role }) {
  const actions = actionsByRole[role];
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-surface-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary transition-transform group-hover:scale-105">
            <a.icon size={18} />
          </span>
          <span className="text-sm font-semibold text-text-primary">{a.label}</span>
          <span className="text-xs text-text-muted">{a.desc}</span>
        </Link>
      ))}
    </div>
  );
}

const eventMeta: Record<ActivityEvent['type'], { icon: LucideIcon; bg: string; color: string }> = {
  score: { icon: Target, bg: 'bg-primary-light', color: 'text-primary' },
  badge: { icon: Award, bg: 'bg-[#FEF6D6]', color: 'text-[#A16207]' },
  join: { icon: GraduationCap, bg: 'bg-[#DBEAFE]', color: 'text-[#1D4ED8]' },
  certificate: { icon: FileText, bg: 'bg-[#D1FAE5]', color: 'text-[#065F46]' },
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-border">
      {events.map((e) => {
        const meta = eventMeta[e.type];
        return (
          <li key={e.id} className="relative flex gap-3">
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}>
              <meta.icon size={15} />
            </span>
            <div className="pt-1">
              <p className="text-sm text-text-primary">{e.text}</p>
              <p className="mt-0.5 text-xs text-text-muted">{relativeTime(e.date)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
