'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock, Users } from 'lucide-react';
import type { Competition } from '@/lib/types';
import { countdownTo, formatDateTime } from '@/lib/utils';
import { DifficultyBadge } from '@/components/ui/Badge';
import { JoinCode } from '@/components/ui/JoinCode';
import { StatusBadge, typeMeta } from './meta';

export function CompetitionCard({
  competition,
  showCode = false,
}: {
  competition: Competition;
  showCode?: boolean;
}) {
  const meta = typeMeta[competition.type];
  const Icon = meta.icon;
  const cd = countdownTo(competition.startTime);

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-hover">
      <Link
        href={`/competitions/${competition.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={`Open ${competition.title}`}
      />

      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light text-primary">
          <Icon size={20} />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <StatusBadge status={competition.status} />
          <DifficultyBadge difficulty={competition.difficulty} />
        </div>
      </div>

      <h3 className="mt-4 text-base font-semibold leading-snug text-text-primary transition-colors group-hover:text-primary">
        {competition.title}
      </h3>
      <p className="mt-0.5 text-xs text-text-muted">{meta.label}</p>

      {competition.description && (
        <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{competition.description}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} className="text-text-muted" />
          {formatDateTime(competition.startTime)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={14} className="text-text-muted" />
          {competition.durationMin} min · {competition.questionCount} Qs
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={14} className="text-text-muted" />
          {competition.participantCount} joined
        </span>
        {competition.status === 'upcoming' && !cd.expired && (
          <span className="font-medium text-primary">Starts in {cd.label}</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        {showCode ? (
          <div className="relative z-10">
            <JoinCode code={competition.joinCode} size="sm" />
          </div>
        ) : (
          <span className="font-mono text-xs text-text-muted">{competition.joinCode}</span>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Details <ArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}
