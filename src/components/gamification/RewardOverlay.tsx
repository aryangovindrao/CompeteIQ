'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Medal, Sparkles, Trophy, Zap } from 'lucide-react';
import type { Attempt } from '@/lib/types';
import { useCountUp } from '@/lib/hooks';
import { formatNumber } from '@/lib/utils';
import { tierMeta } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';

const CONFETTI = [
  { left: '6%', delay: 0, duration: 2.6, color: '#C0392B', size: 9 },
  { left: '14%', delay: 0.5, duration: 3.1, color: '#D4A017', size: 7 },
  { left: '22%', delay: 0.2, duration: 2.4, color: '#10B981', size: 10 },
  { left: '31%', delay: 0.8, duration: 3.4, color: '#6366F1', size: 8 },
  { left: '39%', delay: 0.35, duration: 2.8, color: '#F59E0B', size: 6 },
  { left: '47%', delay: 0.1, duration: 3.2, color: '#C0392B', size: 9 },
  { left: '55%', delay: 0.6, duration: 2.5, color: '#10B981', size: 7 },
  { left: '63%', delay: 0.25, duration: 3.0, color: '#D4A017', size: 11 },
  { left: '71%', delay: 0.9, duration: 2.7, color: '#6366F1', size: 8 },
  { left: '79%', delay: 0.45, duration: 3.3, color: '#F59E0B', size: 7 },
  { left: '87%', delay: 0.15, duration: 2.9, color: '#C0392B', size: 10 },
  { left: '94%', delay: 0.7, duration: 3.1, color: '#10B981', size: 6 },
];

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {CONFETTI.map((c, i) => (
        <motion.span
          key={i}
          className="absolute top-0 rounded-sm"
          style={{ left: c.left, width: c.size, height: c.size * 1.6, backgroundColor: c.color }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 540 }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            ease: 'easeIn',
            repeat: Infinity,
            repeatDelay: 0.6,
          }}
        />
      ))}
    </div>
  );
}

export function RewardOverlay({
  open,
  onClose,
  attempt,
}: {
  open: boolean;
  onClose: () => void;
  attempt: Attempt;
}) {
  const xp = useCountUp(attempt.xpEarned, 1400, open);
  const badges = attempt.newBadges ?? [];
  const passed = attempt.passed;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Confetti />

          <motion.div
            role="dialog"
            aria-modal
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-modal"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          >
            {/* Medallion */}
            <motion.div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white shadow-card"
              style={{
                background: passed
                  ? 'linear-gradient(135deg, #D4A017, #C0392B)'
                  : 'linear-gradient(135deg, #6366F1, #C0392B)',
              }}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 14 }}
            >
              {passed ? <Trophy size={36} /> : <Sparkles size={36} />}
            </motion.div>

            <motion.h2
              className="mt-5 text-2xl font-bold text-text-primary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {passed ? 'Congratulations!' : 'Nice effort!'}
            </motion.h2>
            <motion.p
              className="mt-1 text-sm text-text-secondary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
            >
              {passed
                ? `You scored ${attempt.percentage}% and cleared the pass mark.`
                : `You scored ${attempt.percentage}%. Keep going — you’re close!`}
            </motion.p>

            {/* XP count-up */}
            <motion.div
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-5 py-2.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: 'spring', stiffness: 240, damping: 18 }}
            >
              <Zap size={20} className="text-primary" />
              <span className="text-2xl font-extrabold tabular-nums text-primary">
                +{formatNumber(xp)}
              </span>
              <span className="text-sm font-semibold text-primary/80">XP</span>
            </motion.div>

            {/* Score + rank */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="text-lg font-bold leading-none text-text-primary">
                  {attempt.score}/{attempt.maxScore}
                </p>
                <p className="mt-1 text-xs text-text-muted">Final score</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="inline-flex items-center gap-1 text-lg font-bold leading-none text-text-primary">
                  <Medal size={15} className="text-[#D4A017]" /> #{attempt.rank}
                </p>
                <p className="mt-1 text-xs text-text-muted">of {attempt.totalParticipants}</p>
              </div>
            </div>

            {/* New badges */}
            {badges.length > 0 && (
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {badges.length === 1 ? 'New badge unlocked' : `${badges.length} new badges unlocked`}
                </p>
                <div className="mt-4 flex flex-wrap items-start justify-center gap-5">
                  {badges.map((b, i) => {
                    const meta = tierMeta[b.tier];
                    return (
                      <motion.div
                        key={b.id}
                        className="flex w-20 flex-col items-center text-center"
                        initial={{ opacity: 0, scale: 0.4, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          delay: 0.6 + i * 0.18,
                          type: 'spring',
                          stiffness: 260,
                          damping: 16,
                        }}
                      >
                        <span
                          className="flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl"
                          style={{ borderColor: meta.hex, backgroundColor: meta.tint }}
                        >
                          {b.icon}
                        </span>
                        <span className="mt-2 line-clamp-2 text-xs font-semibold text-text-primary">
                          {b.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button fullWidth className="mt-7" onClick={onClose}>
              Continue
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
