'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Flame,
  Medal,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import type { CompetitionStatus, LeaderboardEntry } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { useClass, useClassLeaderboard, useClassStudents } from '@/lib/hooks';
import {
  formatDate,
  formatDateTime,
  formatNumber,
  countdownTo,
  subjectIconColor,
} from '@/lib/utils';
import { mockActivity, mockCompetitions, mockScoreDistribution, mockSkills } from '@/lib/mock';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { JoinCode } from '@/components/ui/JoinCode';
import { LinkButton } from '@/components/ui/Button';
import {
  ActivityChart,
  Panel,
  ScoreDistributionChart,
  SkillRadarChart,
} from '@/components/dashboard';

const rankColor = ['#D4A017', '#9CA3AF', '#CD7F32'];

function statusBadge(status: CompetitionStatus) {
  if (status === 'live') return <Badge tone="green" dot>Live</Badge>;
  if (status === 'upcoming') return <Badge tone="blue" dot>Upcoming</Badge>;
  if (status === 'draft') return <Badge tone="gray">Draft</Badge>;
  return <Badge tone="gray">Ended</Badge>;
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-text-secondary shadow-sm">
        {icon}
      </span>
      <div>
        <p className="text-base font-bold leading-none text-text-primary">{value}</p>
        <p className="mt-0.5 text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const color = rankColor[rank - 1];
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
      style={
        color
          ? { backgroundColor: `${color}22`, color }
          : { backgroundColor: '#F9FAFB', color: '#6B7280' }
      }
    >
      {rank}
    </span>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
        entry.isCurrentUser ? 'bg-primary-light ring-1 ring-primary/30' : 'hover:bg-surface-2'
      }`}
    >
      <RankBadge rank={entry.rank} />
      <Avatar name={entry.name} src={entry.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {entry.name}
          {entry.isCurrentUser && <span className="ml-1.5 text-xs text-primary">You</span>}
        </p>
        <p className="truncate text-xs text-text-muted">{entry.instituteName}</p>
      </div>
      <div className="hidden items-center gap-1 text-xs text-text-secondary sm:flex">
        <Medal size={13} className="text-text-muted" /> {entry.badgeCount}
      </div>
      <div className="hidden items-center gap-1 text-xs text-text-secondary sm:flex">
        <Flame size={13} className="text-warning" /> {entry.streakDays}
      </div>
      <span className="w-20 text-right text-sm font-semibold text-text-primary">
        {formatNumber(entry.xpTotal)} XP
      </span>
    </div>
  );
}

export function ClassDetailView({ id }: { id: string }) {
  const { user } = useAuth();
  const isStaff = user?.role === 'teacher' || user?.role === 'institute_admin';

  const { data: classroom, isLoading } = useClass(id);
  const { data: students } = useClassStudents(id);
  const { data: leaderboard } = useClassLeaderboard(id);

  const [tab, setTab] = useState('overview');

  if (isLoading || !classroom) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  const color = subjectIconColor[classroom.subject] ?? '#C0392B';
  const competitions = mockCompetitions.filter((c) => c.classId === id);
  const topPerformers = (leaderboard ?? []).slice(0, 5);

  const tabItems = [
    { value: 'overview', label: 'Overview' },
    { value: 'competitions', label: 'Competitions', count: competitions.length },
    { value: 'leaderboard', label: 'Leaderboard' },
    ...(isStaff
      ? [
          { value: 'students', label: 'Students', count: classroom.studentCount },
          { value: 'analytics', label: 'Analytics' },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/classes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
      >
        <ArrowLeft size={15} /> All classes
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}1A`, color }}
            >
              <BookOpen size={26} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  {classroom.name}
                </h1>
                <Badge tone="primary">{classroom.subject}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Avatar name={classroom.teacherName} size="xs" />
                <span className="text-sm text-text-secondary">
                  Taught by {classroom.teacherName}
                </span>
              </div>
              {classroom.description && (
                <p className="mt-3 max-w-2xl text-sm text-text-secondary">
                  {classroom.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <JoinCode code={classroom.joinCode} />
            {isStaff && (
              <LinkButton href="/ai-generator" size="sm" leftIcon={<Sparkles size={15} />}>
                New competition
              </LinkButton>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
          <StatTile icon={<Users size={17} />} label="Students" value={`${classroom.studentCount}`} />
          <StatTile
            icon={<Trophy size={17} />}
            label="Active competitions"
            value={`${classroom.activeCompetitions}`}
          />
          <StatTile icon={<BarChart3 size={17} />} label="Average score" value={`${classroom.avgScore}%`} />
          <StatTile
            icon={<CalendarDays size={17} />}
            label="Created"
            value={formatDate(classroom.createdAt)}
          />
        </div>
      </div>

      <Tabs value={tab} onChange={setTab} items={tabItems} />

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel title="About this class">
              <p className="text-sm leading-relaxed text-text-secondary">
                {classroom.description ?? 'No description provided for this class yet.'}
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Class average
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={classroom.avgScore} className="flex-1" />
                    <span className="text-sm font-semibold text-text-primary">
                      {classroom.avgScore}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Join code
                  </p>
                  <div className="mt-2">
                    <JoinCode code={classroom.joinCode} size="sm" />
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              title="Competitions"
              subtitle={`${competitions.length} in this class`}
              action={
                competitions.length ? (
                  <button
                    onClick={() => setTab('competitions')}
                    className="text-xs font-medium text-primary hover:text-primary-dark"
                  >
                    View all
                  </button>
                ) : undefined
              }
              bodyClassName="space-y-2"
            >
              {competitions.length ? (
                competitions.slice(0, 3).map((c) => (
                  <Link
                    key={c.id}
                    href={`/competitions/${c.id}`}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-surface-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{c.title}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {c.questionCount} questions · {c.durationMin} min
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {statusBadge(c.status)}
                      <ChevronRight size={16} className="text-text-muted" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-text-muted">No competitions in this class yet.</p>
              )}
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel
              title="Top performers"
              action={
                <button
                  onClick={() => setTab('leaderboard')}
                  className="text-xs font-medium text-primary hover:text-primary-dark"
                >
                  View all
                </button>
              }
              bodyClassName="space-y-1"
            >
              {topPerformers.length ? (
                topPerformers.map((e) => <LeaderboardRow key={e.userId} entry={e} />)
              ) : (
                <p className="text-sm text-text-muted">No rankings yet.</p>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* Competitions */}
      {tab === 'competitions' && (
        <div className="space-y-3">
          {competitions.length ? (
            competitions.map((c) => (
              <Link
                key={c.id}
                href={`/competitions/${c.id}`}
                className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-hover sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-text-primary">{c.title}</h3>
                    {statusBadge(c.status)}
                    <DifficultyBadge difficulty={c.difficulty} />
                  </div>
                  {c.description && (
                    <p className="mt-1 line-clamp-1 text-sm text-text-secondary">{c.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={13} /> {formatDateTime(c.startTime)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={13} /> {c.participantCount} joined
                    </span>
                    <span>
                      {c.questionCount} questions · {c.durationMin} min
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {c.status === 'upcoming' && (
                    <span className="text-xs font-medium text-text-secondary">
                      Starts in {countdownTo(c.startTime).label}
                    </span>
                  )}
                  <ChevronRight size={18} className="text-text-muted" />
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              icon={<Trophy size={22} />}
              title="No competitions yet"
              description={
                isStaff
                  ? 'Create a competition for this class to get your students competing.'
                  : 'Your teacher has not scheduled a competition for this class yet.'
              }
              action={
                isStaff ? (
                  <LinkButton href="/ai-generator" leftIcon={<Sparkles size={15} />}>
                    Create competition
                  </LinkButton>
                ) : undefined
              }
            />
          )}
        </div>
      )}

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <Panel title="Class leaderboard" subtitle="Ranked by total XP" bodyClassName="space-y-1">
          {leaderboard && leaderboard.length ? (
            leaderboard.map((e) => <LeaderboardRow key={e.userId} entry={e} />)
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </Panel>
      )}

      {/* Students (staff) */}
      {tab === 'students' && (
        <Panel title="Enrolled students" subtitle={`${classroom.studentCount} total`} bodyClassName="p-0">
          {students && students.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Student</th>
                    <th className="px-5 py-3 text-right font-medium">Total XP</th>
                    <th className="px-5 py-3 text-right font-medium">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-surface-2"
                    >
                      <td className="px-5 py-3 text-text-muted">{i + 1}</td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/profile/${s.id}`}
                          className="flex items-center gap-3 hover:text-primary"
                        >
                          <Avatar name={s.name} src={s.avatarUrl} size="sm" />
                          <span>
                            <span className="block font-medium text-text-primary">{s.name}</span>
                            <span className="block text-xs text-text-muted">{s.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-text-primary">
                        {formatNumber(s.xpTotal)}
                      </td>
                      <td className="px-5 py-3 text-right text-text-secondary">
                        {formatDate(s.enrolledAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <Skeleton className="h-40 w-full" />
            </div>
          )}
        </Panel>
      )}

      {/* Analytics (staff) */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Score distribution" subtitle="Most recent competition">
              <ScoreDistributionChart data={mockScoreDistribution} />
            </Panel>
            <Panel title="Skill mastery" subtitle="Average score by subject">
              <SkillRadarChart data={mockSkills} />
            </Panel>
          </div>
          <Panel title="Weekly activity" subtitle="Engagement over the last 7 days">
            <ActivityChart data={mockActivity} />
          </Panel>
        </div>
      )}
    </div>
  );
}
