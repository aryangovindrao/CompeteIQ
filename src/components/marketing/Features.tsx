'use client';

import { motion } from 'framer-motion';
import {
  Award,
  BarChart3,
  CreditCard,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Container, SectionHeading } from './Section';

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const features: Feature[] = [
  { icon: Trophy, title: 'Host Any Competition', body: 'MCQ, coding, subjective — create and launch tests in minutes with custom join codes.' },
  { icon: Users, title: 'Manage Classes & Teachers', body: 'Invite teachers, create classes, enroll students via unique codes. Full role-based access.' },
  { icon: Sparkles, title: 'AI Question Generator', body: 'Upload your syllabus PDF. AI generates MCQ, subjective, and true/false questions instantly.' },
  { icon: BarChart3, title: 'Live Leaderboards', body: 'Real-time WebSocket rankings during competitions. Students see their rank update live.' },
  { icon: Award, title: 'Badges & Certificates', body: 'Auto-award badges for streaks, perfect scores, top ranks. Generate PDF certificates instantly.' },
  { icon: CreditCard, title: 'Simple Pricing', body: 'Start free. Scale with your institute. No per-student charges — flat monthly plans.' },
];

export function Features() {
  return (
    <section id="features" className="bg-surface-2 py-20">
      <Container>
        <SectionHeading
          label="Why CompeteIQ"
          title="Everything Your Institute Needs"
          subtitle="One platform to create, run, and analyze competitions — from a single classroom quiz to an institute-wide championship."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="group rounded-xl border border-border bg-white p-6 transition-shadow duration-200 hover:shadow-hover"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
