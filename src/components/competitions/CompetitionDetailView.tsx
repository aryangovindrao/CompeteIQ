'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileQuestion,
  Flag,
  Play,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  Wifi,
} from 'lucide-react';
import type { Competition } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { useCompetition } from '@/lib/hooks';
import { useCountdown } from '@/lib/hooks';
import { formatDateTime } from '@/lib/utils';
import { Button, LinkButton } from '@/components/ui/Button';
import { DifficultyBadge } from '@/components/ui/Badge';
import { JoinCode } from '@/components/ui/JoinCode';
import { Skeleton } from '@/components/ui/Skeleton';
import { Panel } from '@/components/dashboard';
import { StatusBadge, typeMeta } from './meta';

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
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3.5">
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

const prepItems = [
  { icon: Wifi, text: 'Stable internet connection' },
  { icon: ShieldCheck, text: 'Quiet, distraction-free space' },
  { icon: Clock, text: 'Timer starts the moment you begin' },
  { icon: Flag, text: 'Flag tricky questions and revisit them' },
];

function PrimaryCTA({
  competition,
  isStaff,
  countdownLabel,
}: {
  competition: Competition;
  isStaff: boolean;
  countdownLabel: string;
}) {
  const id = competition.id;

  if (isStaff) {
    return (
      <div className="flex flex-wrap gap-2">
        <LinkButton href={`/competitions/${id}/results`} leftIcon={<BarChart3 size={16} />}>
          {competition.status === 'ended' ? 'View results' : 'Live results'}
        </LinkButton>
        <LinkButton
          href={`/competitions/${id}/attempt`}
          variant="secondary"
          leftIcon={<Eye size={16} />}
        >
          Preview
        </LinkButton>
      </div>
    );
  }

  if (competition.status === 'live') {
    return (
      <LinkButton href={`/competitions/${id}/attempt`} size="lg" leftIcon={<Play size={17} />}>
        Start attempt
      </LinkButton>
    );
  }
  if (competition.status === 'upcoming') {
    return (
      <Button size="lg" disabled leftIcon={<Clock size={17} />}>
        Starts in {countdownLabel}
      </Button>
    );
  }
  if (competition.status === 'ended') {
    if (competition.joined || competition.attemptId) {
      return (
        <LinkButton
          href={`/competitions/${id}/results`}
          size="lg"
          leftIcon={<BarChart3 size={17} />}
        >
          View your results
        </LinkButton>
      );
    }
    return (
      <Button size="lg" disabled>
        Competition ended
      </Button>
    );
  }
  return (
    <Button size="lg" disabled>
      Not yet published
    </Button>
  );
}

export function CompetitionDetailView({ id }: { id: string }) {
  const { user } = useAuth();
  const isStaff = user?.role === 'teacher' || user?.role === 'institute_admin';
  const { data: competition, isLoading } = useCompetition(id);
  const cd = useCountdown(competition?.startTime ?? new Date().toISOString());

  if (isLoading || !competition) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const meta = typeMeta[competition.type];
  const Icon = meta.icon;

  return (
    <div className="space-y-6">
      <Link
        href="/competitions"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
      >
        <ArrowLeft size={15} /> All competitions
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Icon size={26} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  {competition.title}
                </h1>
                <StatusBadge status={competition.status} />
                <DifficultyBadge difficulty={competition.difficulty} />
              </div>
              <p className="mt-1 text-sm text-text-muted">
                {meta.label} · Hosted by {competition.createdBy} · {competition.instituteName}
              </p>
              {competition.description && (
                <p className="mt-3 max-w-2xl text-sm text-text-secondary">
                  {competition.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <JoinCode code={competition.joinCode} />
            <PrimaryCTA competition={competition} isStaff={isStaff} countdownLabel={cd.label} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
          <StatTile
            icon={<FileQuestion size={17} />}
            label="Questions"
            value={`${competition.questionCount}`}
          />
          <StatTile icon={<Clock size={17} />} label="Duration" value={`${competition.durationMin} min`} />
          <StatTile icon={<Trophy size={17} />} label="Max score" value={`${competition.maxScore}`} />
          <StatTile
            icon={<Target size={17} />}
            label="Pass mark"
            value={`${competition.passThreshold}%`}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="What to expect">
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                <span>
                  {competition.questionCount} {meta.label.toLowerCase()} questions worth{' '}
                  {competition.maxScore} points in total.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                <span>
                  You have {competition.durationMin} minutes once you start — the timer does not
                  pause.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                <span>
                  Score at least {competition.passThreshold}% to pass and earn a certificate.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                <span>Switching tabs is monitored and may be flagged to your teacher.</span>
              </li>
            </ul>
          </Panel>

          <Panel title="Schedule">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <CalendarDays size={18} />
                </span>
                <div>
                  <p className="text-xs text-text-muted">Opens</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {formatDateTime(competition.startTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-text-secondary">
                  <Flag size={18} />
                </span>
                <div>
                  <p className="text-xs text-text-muted">Closes</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {formatDateTime(competition.endTime)}
                  </p>
                </div>
              </div>
            </div>
            {competition.status === 'upcoming' && !cd.expired && (
              <div className="mt-4 rounded-lg bg-primary-light px-4 py-3 text-sm font-medium text-primary">
                Starts in {cd.label}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={isStaff ? 'Host tools' : 'Before you start'}>
            {isStaff ? (
              <div className="space-y-2">
                <LinkButton
                  href={`/competitions/${id}/results`}
                  variant="secondary"
                  fullWidth
                  leftIcon={<BarChart3 size={15} />}
                >
                  Results & analytics
                </LinkButton>
                <LinkButton
                  href={`/competitions/${id}/attempt`}
                  variant="secondary"
                  fullWidth
                  leftIcon={<Eye size={15} />}
                >
                  Preview as student
                </LinkButton>
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm">
                  <span className="inline-flex items-center gap-2 text-text-secondary">
                    <Users size={15} className="text-text-muted" /> Participants
                  </span>
                  <span className="font-semibold text-text-primary">
                    {competition.participantCount}
                  </span>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {prepItems.map((p) => {
                  const PIcon = p.icon;
                  return (
                    <li key={p.text} className="flex items-center gap-3 text-sm text-text-secondary">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-text-secondary">
                        <PIcon size={16} />
                      </span>
                      {p.text}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <div className="rounded-xl border border-border bg-surface-2 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Users size={16} className="text-primary" /> {competition.participantCount} participants
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Join code <span className="font-mono font-semibold">{competition.joinCode}</span> ·
              share it with classmates to compete together.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
