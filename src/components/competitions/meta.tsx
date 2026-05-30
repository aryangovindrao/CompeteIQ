import { Code2, ListChecks, PenLine, Shuffle, type LucideIcon } from 'lucide-react';
import type { CompetitionStatus, CompetitionType } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

export const typeMeta: Record<CompetitionType, { label: string; icon: LucideIcon }> = {
  mcq: { label: 'Multiple choice', icon: ListChecks },
  coding: { label: 'Coding', icon: Code2 },
  subjective: { label: 'Subjective', icon: PenLine },
  mixed: { label: 'Mixed format', icon: Shuffle },
};

export function StatusBadge({ status }: { status: CompetitionStatus }) {
  if (status === 'live')
    return (
      <Badge tone="green" dot>
        Live
      </Badge>
    );
  if (status === 'upcoming')
    return (
      <Badge tone="blue" dot>
        Upcoming
      </Badge>
    );
  if (status === 'draft') return <Badge tone="gray">Draft</Badge>;
  return <Badge tone="gray">Ended</Badge>;
}
