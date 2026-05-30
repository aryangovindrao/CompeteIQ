'use client';

import { useMemo, useState } from 'react';
import { Search, Sparkles, Ticket, Trophy } from 'lucide-react';
import type { CompetitionStatus, CompetitionType } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { useCompetitions } from '@/lib/hooks';
import { PageHeader } from '@/components/dashboard';
import { Button, LinkButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PillTabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CompetitionCard } from './CompetitionCard';

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ended', label: 'Ended' },
];

const typeOptions = [
  { value: 'all', label: 'All formats' },
  { value: 'mcq', label: 'Multiple choice' },
  { value: 'coding', label: 'Coding' },
  { value: 'subjective', label: 'Subjective' },
  { value: 'mixed', label: 'Mixed' },
];

export function CompetitionsView() {
  const { user } = useAuth();
  const isStaff = user?.role === 'teacher' || user?.role === 'institute_admin';
  const { data: competitions, isLoading } = useCompetitions();

  const [status, setStatus] = useState<CompetitionStatus | 'all'>('all');
  const [type, setType] = useState<CompetitionType | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const list = competitions ?? [];
    return list.filter((c) => {
      if (status !== 'all' && c.status !== status) return false;
      if (type !== 'all' && c.type !== type) return false;
      if (query && !`${c.title} ${c.description ?? ''}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [competitions, status, type, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitions"
        subtitle={
          isStaff
            ? 'Host, monitor, and review competitions across your classes.'
            : 'Join live competitions, prep for upcoming ones, and revisit past results.'
        }
        actions={
          isStaff ? (
            <LinkButton href="/ai-generator" leftIcon={<Sparkles size={16} />}>
              Create competition
            </LinkButton>
          ) : (
            <LinkButton href="/join" leftIcon={<Ticket size={16} />}>
              Join with code
            </LinkButton>
          )
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PillTabs
          value={status}
          onChange={(v) => setStatus(v as CompetitionStatus | 'all')}
          items={statusTabs}
        />
        <div className="flex flex-1 items-center gap-3 lg:max-w-md">
          <Input
            placeholder="Search competitions…"
            leftIcon={<Search size={16} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="w-44 shrink-0">
            <Select
              options={typeOptions}
              value={type}
              onChange={(e) => setType(e.target.value as CompetitionType | 'all')}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CompetitionCard key={c.id} competition={c} showCode={isStaff} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Trophy size={22} />}
          title="No competitions found"
          description={
            query || status !== 'all' || type !== 'all'
              ? 'Try clearing filters or searching for something else.'
              : isStaff
                ? 'Create your first competition to get started.'
                : 'No competitions are available right now — check back soon.'
          }
          action={
            query || status !== 'all' || type !== 'all' ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                  setType('all');
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
