'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Search, Sparkles, Users } from 'lucide-react';
import type { ClassStudent } from '@/lib/types';
import { mockClasses, mockClassStudents } from '@/lib/mock';
import { formatDate, formatNumber, subjectIconColor } from '@/lib/utils';
import { PageHeader, Panel } from '@/components/dashboard';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface DirectoryStudent extends ClassStudent {
  classId: string;
  className: string;
  subject: string;
}

type SortKey = 'xp' | 'name' | 'recent';

const directory: DirectoryStudent[] = mockClassStudents.map((s, i) => {
  const cls = mockClasses[i % mockClasses.length];
  return { ...s, classId: cls.id, className: cls.name, subject: cls.subject };
});

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-card">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xl font-bold leading-none text-text-primary">{value}</p>
        <p className="mt-1 text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

export function StudentsView() {
  const [query, setQuery] = useState('');
  const [classId, setClassId] = useState('all');
  const [sort, setSort] = useState<SortKey>('xp');

  const totalXp = directory.reduce((sum, s) => sum + s.xpTotal, 0);
  const avgXp = directory.length ? Math.round(totalXp / directory.length) : 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = directory.filter((s) => {
      const matchesQuery =
        !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchesClass = classId === 'all' || s.classId === classId;
      return matchesQuery && matchesClass;
    });
    return rows.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'recent') return +new Date(b.enrolledAt) - +new Date(a.enrolledAt);
      return b.xpTotal - a.xpTotal;
    });
  }, [query, classId, sort]);

  const classOptions = [
    { value: 'all', label: 'All classes' },
    ...mockClasses.map((c) => ({ value: c.id, label: c.name })),
  ];

  const filtersActive = query.trim() !== '' || classId !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="Every learner enrolled across your classes, ranked by experience."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile icon={<Users size={18} />} label="Total students" value={`${directory.length}`} />
        <SummaryTile
          icon={<GraduationCap size={18} />}
          label="Active classes"
          value={`${mockClasses.length}`}
        />
        <SummaryTile icon={<Sparkles size={18} />} label="Average XP" value={formatNumber(avgXp)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-xs sm:flex-1">
          <Input
            leftIcon={<Search size={16} />}
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Select
            options={classOptions}
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="sm:w-48"
          />
          <Select
            options={[
              { value: 'xp', label: 'Sort: Top XP' },
              { value: 'name', label: 'Sort: Name (A–Z)' },
              { value: 'recent', label: 'Sort: Recently joined' },
            ]}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="sm:w-48"
          />
        </div>
      </div>

      <Panel
        title="Student directory"
        subtitle={`${filtered.length} of ${directory.length} students`}
        bodyClassName="p-0"
      >
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Class</th>
                  <th className="px-5 py-3 text-right font-medium">Total XP</th>
                  <th className="hidden px-5 py-3 text-right font-medium md:table-cell">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const color = subjectIconColor[s.subject] ?? '#C0392B';
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-border transition-colors last:border-0 hover:bg-surface-2"
                    >
                      <td className="px-5 py-3 text-text-muted">{i + 1}</td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/profile/${s.id}`}
                          className="flex items-center gap-3 hover:text-primary"
                        >
                          <Avatar name={s.name} src={s.avatarUrl} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-text-primary">
                              {s.name}
                            </span>
                            <span className="block truncate text-xs text-text-muted">{s.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="hidden px-5 py-3 sm:table-cell">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: `${color}1A`, color }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                          {s.className}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-text-primary">
                        {formatNumber(s.xpTotal)}
                      </td>
                      <td className="hidden px-5 py-3 text-right text-text-secondary md:table-cell">
                        {formatDate(s.enrolledAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={<Users size={22} />}
              title="No students match your filters"
              description="Try a different search term or clear the active filters."
              action={
                filtersActive ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery('');
                      setClassId('all');
                    }}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
