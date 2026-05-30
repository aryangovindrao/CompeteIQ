'use client';

import { motion } from 'framer-motion';
import { Award, Flame, Medal, TrendingUp, Trophy, Zap, type LucideIcon } from 'lucide-react';
import { Container, SectionHeading } from './Section';

interface GameFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: GameFeature[] = [
  { icon: Zap, title: 'XP & levels', desc: 'Every correct answer earns XP. Students level up and unlock new tiers as they learn.' },
  { icon: Medal, title: 'Badges & achievements', desc: 'Auto-awarded for streaks, perfect scores, and podium finishes — bronze to platinum.' },
  { icon: Flame, title: 'Daily streaks', desc: 'Show up, keep the flame alive. Streaks drive consistent practice and retention.' },
  { icon: Trophy, title: 'Live leaderboards', desc: 'Real-time class and global rankings that update the instant a score lands.' },
];

const tiers = [
  { name: 'Bronze', cls: 'text-tier-bronze', ring: 'ring-tier-bronze/40', bg: 'bg-tier-bronze/10' },
  { name: 'Silver', cls: 'text-tier-silver', ring: 'ring-tier-silver/50', bg: 'bg-tier-silver/15' },
  { name: 'Gold', cls: 'text-tier-gold', ring: 'ring-tier-gold/50', bg: 'bg-tier-gold/15' },
  { name: 'Platinum', cls: 'text-tier-platinum', ring: 'ring-white/30', bg: 'bg-white/10' },
];

export function GamificationShowcase() {
  return (
    <section className="bg-surface-2 py-20">
      <Container>
        <SectionHeading
          label="Gamified Learning"
          title={
            <>
              Learning that feels like <span className="text-primary">winning</span>
            </>
          }
          subtitle="Turn assessments into a game students actually want to play — with XP, badges, streaks, and leaderboards baked into every competition."
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          {/* Visual card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="order-2 rounded-2xl border border-border bg-white p-6 shadow-card lg:order-1"
          >
            {/* level + xp */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
                  12
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Level 12 · Scholar</p>
                  <p className="text-xs text-text-muted">340 / 500 XP to next level</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
                <Zap size={12} /> 3,840 XP
              </span>
            </div>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark"
                initial={{ width: 0 }}
                whileInView={{ width: '68%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.2 }}
              />
            </div>

            {/* tier badges */}
            <div className="mt-7 grid grid-cols-4 gap-3">
              {tiers.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${t.bg} ring-2 ${t.ring}`}>
                    <Award size={24} className={t.cls} />
                  </div>
                  <span className="text-[11px] font-medium text-text-secondary">{t.name}</span>
                </motion.div>
              ))}
            </div>

            {/* streak */}
            <div className="mt-7 flex items-center justify-between rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning">
                  <Flame size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">7-day streak</p>
                  <p className="text-xs text-text-muted">Keep it going — practice today</p>
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-6 w-2.5 rounded-full bg-warning"
                    style={{ opacity: 0.4 + (i / 7) * 0.6 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Feature rows */}
          <div className="order-1 space-y-2 lg:order-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-4 rounded-xl p-4 transition-colors hover:bg-white"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <f.icon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{f.desc}</p>
                </div>
              </motion.div>
            ))}
            <div className="flex items-center gap-2 px-4 pt-3 text-sm font-medium text-primary">
              <TrendingUp size={16} />
              Institutes report up to 3× higher participation
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
