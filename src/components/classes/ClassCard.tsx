'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Trophy, Users } from 'lucide-react';
import type { ClassRoom } from '@/lib/types';
import { subjectIconColor } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { JoinCode } from '@/components/ui/JoinCode';

export function ClassCard({
  classroom,
  showCode = false,
}: {
  classroom: ClassRoom;
  showCode?: boolean;
}) {
  const color = subjectIconColor[classroom.subject] ?? '#C0392B';

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-hover">
      {/* Stretched link makes the whole card clickable while keeping the
          copy-code button (z-10) independently interactive. */}
      <Link
        href={`/classes/${classroom.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={`Open ${classroom.name}`}
      />

      <div className="flex items-start justify-between">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          <BookOpen size={20} />
        </span>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-text-secondary">
          {classroom.avgScore}% avg
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold leading-snug text-text-primary transition-colors group-hover:text-primary">
        {classroom.name}
      </h3>
      <p className="mt-0.5 text-sm text-text-muted">{classroom.subject}</p>

      {classroom.description && (
        <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{classroom.description}</p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Avatar name={classroom.teacherName} size="xs" />
        <span className="text-xs text-text-secondary">{classroom.teacherName}</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <Users size={14} className="text-text-muted" />
          {classroom.studentCount} students
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Trophy size={14} className="text-text-muted" />
          {classroom.activeCompetitions} active
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {showCode ? (
          <div className="relative z-10">
            <JoinCode code={classroom.joinCode} size="sm" />
          </div>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View class <ArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}
