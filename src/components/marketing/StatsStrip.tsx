'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Award, Building2, GraduationCap, Trophy, type LucideIcon } from 'lucide-react';
import { useCountUp } from '@/lib/hooks';
import { Container } from './Section';

interface Stat {
  icon: LucideIcon;
  value: number;
  suffix?: string;
  label: string;
}

const stats: Stat[] = [
  { icon: GraduationCap, value: 12000, suffix: '+', label: 'Registered Students' },
  { icon: Building2, value: 45, label: 'Partner Institutes' },
  { icon: Trophy, value: 3200, suffix: '+', label: 'Competitions Hosted' },
  { icon: Award, value: 9600, suffix: '+', label: 'Certificates Issued' },
];

function StatItem({ stat, start }: { stat: Stat; start: boolean }) {
  const count = useCountUp(stat.value, 1600, start);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-primary ring-1 ring-white/10">
        <stat.icon size={22} />
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {count.toLocaleString()}
        {stat.suffix}
      </p>
      <p className="mt-1 text-sm text-white/50">{stat.label}</p>
    </div>
  );
}

export function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-dark py-16">
      <Container>
        <div ref={ref} className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {stats.map((s) => (
            <StatItem key={s.label} stat={s} start={inView} />
          ))}
        </div>
      </Container>
    </section>
  );
}
