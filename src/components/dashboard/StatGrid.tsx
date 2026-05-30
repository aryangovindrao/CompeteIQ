'use client';

import { motion } from 'framer-motion';
import type { StatCard as StatCardType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/ui/Sparkline';
import { TrendChip } from '@/components/ui/TrendChip';
import { SkeletonCard } from '@/components/ui/Skeleton';

export function StatCard({ stat, index = 0 }: { stat: StatCardType; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="rounded-lg border border-border bg-white p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
        <TrendChip value={stat.trend} suffix="" />
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">{stat.value}</p>
      <div className="mt-3">
        <Sparkline data={stat.spark} height={36} />
      </div>
    </motion.div>
  );
}

export function StatGrid({
  stats,
  loading,
  columns = 4,
  className,
}: {
  stats?: StatCardType[];
  loading?: boolean;
  columns?: 3 | 4;
  className?: string;
}) {
  const cols = columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-4';
  if (loading || !stats) {
    return (
      <div className={cn('grid gap-4', cols, className)}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className={cn('grid gap-4', cols, className)}>
      {stats.map((s, i) => (
        <StatCard key={s.label} stat={s} index={i} />
      ))}
    </div>
  );
}
