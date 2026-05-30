'use client';

import { motion } from 'framer-motion';
import { BarChart3, Brain, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Container, SectionHeading } from './Section';

interface Bullet {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const bullets: Bullet[] = [
  {
    icon: Brain,
    title: 'AI-assisted authoring',
    desc: 'Turn any syllabus into exam-ready MCQ, subjective, and coding questions in seconds.',
  },
  {
    icon: ShieldCheck,
    title: 'Proctoring & integrity',
    desc: 'Tab-switch detection, randomized question order, and time-locked attempts keep results fair.',
  },
  {
    icon: BarChart3,
    title: 'Analytics that teach',
    desc: 'Per-question difficulty, skill gaps, and cohort trends — exported the moment a test ends.',
  },
];

const miniBars = [42, 64, 53, 78, 88, 72, 96];

export function DarkSection() {
  return (
    <section className="bg-dark py-20 text-white">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        {/* Left — copy */}
        <div>
          <SectionHeading
            dark
            center={false}
            label="Built for Scale"
            title={
              <>
                A smart assessment platform built for{' '}
                <span className="text-primary">real institutes</span>
              </>
            }
            subtitle="From a single classroom quiz to an institute-wide championship with thousands of concurrent students — CompeteIQ holds up."
          />

          <div className="mt-10 space-y-7">
            {bullets.map((b, i) => (
              <motion.div
                key={b.title}
                className="flex gap-4"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary ring-1 ring-white/10">
                  <b.icon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{b.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right — dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-dark-2 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Institute Analytics</p>
              <p className="text-xs text-white/40">Last 7 days · all classes</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Healthy
            </span>
          </div>

          {/* stat tiles */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: 'Avg. Score', value: '78%' },
              { label: 'Completion', value: '94%' },
              { label: 'Live now', value: '312' },
            ].map((t) => (
              <div key={t.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-lg font-bold text-white">{t.value}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/40">{t.label}</p>
              </div>
            ))}
          </div>

          {/* mini bar chart */}
          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
              {miniBars.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.06 }}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wide text-white/30">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
