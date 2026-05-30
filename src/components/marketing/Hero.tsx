'use client';

import { motion } from 'framer-motion';
import { Award, Check, Play, TrendingUp } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Container } from './Section';

const leaders = [
  { name: 'Aisha Khan', xp: 980, pct: 95 },
  { name: 'Liam Chen', xp: 910, pct: 82 },
  { name: 'Sofia Garcia', xp: 860, pct: 74 },
];

const trust = ['No credit card required', 'Setup in 5 minutes', 'Free forever plan'];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <Container className="grid items-center gap-12 py-16 lg:grid-cols-5 lg:py-24">
        {/* Left 60% */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge tone="gray" className="px-3 py-1">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            Trusted by 500+ Institutes
          </Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-[56px]">
            Host Smarter
            <br />
            Competitions &amp;
            <br />
            Tests for Your <span className="text-primary">School</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">
            CompeteIQ gives every institute the tools to run live competitions,
            gamified learning, and AI-powered assessments — all in one platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/register" size="lg">
              Start Free Trial
            </LinkButton>
            <LinkButton href="/#features" variant="secondary" size="lg" leftIcon={<Play size={16} />}>
              View Demo
            </LinkButton>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted">
            {trust.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check size={15} className="text-success" /> {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right 40% — floating preview */}
        <motion.div
          className="relative lg:col-span-2"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="absolute -inset-6 -z-10 rounded-full bg-primary/15 blur-3xl" />

          <div className="rotate-1 rounded-xl border border-border bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">Live Leaderboard</p>
                <p className="text-xs text-text-muted">React Fundamentals Challenge</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live
              </span>
            </div>
            <div className="space-y-3">
              {leaders.map((l, i) => (
                <div key={l.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-text-secondary">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-text-primary">{l.name}</span>
                      <span className="text-text-muted">{l.xp} XP</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${l.pct}%` }}
                        transition={{ duration: 0.9, delay: 0.4 + i * 0.15 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating stat pill (top-right) */}
          <motion.div
            className="absolute -right-3 -top-5 flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 shadow-hover"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-light text-primary">
              <TrendingUp size={15} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-none text-text-primary">215 Tests today</p>
              <p className="text-[11px] text-success">↑ 34%</p>
            </div>
          </motion.div>

          {/* Floating badge notification (bottom-left) */}
          <motion.div
            className="absolute -bottom-5 -left-3 flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 shadow-hover"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FEF3C7] text-[#92400E]">
              <Award size={15} />
            </div>
            <p className="text-xs font-semibold text-text-primary">🏆 New badge earned!</p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
