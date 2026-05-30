'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { BadgeTier, UserBadge } from '@/lib/types';
import { cn, relativeTime } from '@/lib/utils';

export interface TierMeta {
  label: string;
  hex: string;
  tint: string;
  pill: string;
}

export const tierMeta: Record<BadgeTier, TierMeta> = {
  bronze: { label: 'Bronze', hex: '#CD7F32', tint: '#FBEFE4', pill: 'bg-[#FBEFE4] text-[#B45309]' },
  silver: { label: 'Silver', hex: '#9CA3AF', tint: '#F1F3F5', pill: 'bg-[#F1F3F5] text-[#475569]' },
  gold: { label: 'Gold', hex: '#D4A017', tint: '#FEF6D6', pill: 'bg-[#FEF6D6] text-[#A16207]' },
  platinum: { label: 'Platinum', hex: '#6366F1', tint: '#EEF2FF', pill: 'bg-[#EEF2FF] text-[#4338CA]' },
};

export function BadgeTile({
  badge,
  index = 0,
  showDate = false,
}: {
  badge: UserBadge;
  index?: number;
  showDate?: boolean;
}) {
  const meta = tierMeta[badge.tier];
  const earned = badge.earned;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 220, damping: 18 }}
      className="flex flex-col items-center text-center"
      title={`${badge.name} — ${badge.description}`}
    >
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 text-2xl"
        style={{
          borderColor: earned ? meta.hex : '#E5E7EB',
          backgroundColor: earned ? meta.tint : '#F9FAFB',
          filter: earned ? undefined : 'grayscale(1)',
          opacity: earned ? 1 : 0.6,
        }}
      >
        <span>{badge.icon}</span>
        {!earned && (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-white text-text-muted">
            <Lock size={11} />
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-xs font-semibold text-text-primary">{badge.name}</p>
      <span className={cn('mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', meta.pill)}>
        {meta.label}
      </span>
      {showDate && earned && badge.awardedAt && (
        <span className="mt-1 text-[10px] text-text-muted">{relativeTime(badge.awardedAt)}</span>
      )}
    </motion.div>
  );
}

export function BadgesGrid({
  badges,
  showDate = false,
  className,
}: {
  badges: UserBadge[];
  showDate?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-8', className)}>
      {badges.map((b, i) => (
        <BadgeTile key={b.id} badge={b} index={i} showDate={showDate} />
      ))}
    </div>
  );
}
