import type { Metadata } from 'next';
import { Heart, Lightbulb, Target, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { CTASection, Container, SectionHeading, StatsStrip } from '@/components/marketing';

export const metadata: Metadata = {
  title: 'About — CompeteIQ',
  description: 'We help institutes turn learning into a game worth winning.',
};

const values = [
  { icon: Target, title: 'Outcomes first', desc: 'Every feature exists to move a real classroom metric — participation, mastery, or fairness.' },
  { icon: Heart, title: 'Built with teachers', desc: 'We ship alongside the educators who use CompeteIQ every day, not in isolation.' },
  { icon: Lightbulb, title: 'Simple by default', desc: 'Powerful tooling that a first-time admin can run without a manual or a sales call.' },
  { icon: Users, title: 'Fair for everyone', desc: 'Integrity, accessibility, and transparent scoring are baked into the core, not bolted on.' },
];

const team = [
  { name: 'Rajesh Kapoor', role: 'Co-founder & CEO' },
  { name: 'Meera Nair', role: 'Co-founder & Head of Product' },
  { name: 'Aisha Khan', role: 'Engineering Lead' },
  { name: 'Liam Chen', role: 'Design Lead' },
];

export default function AboutPage() {
  return (
    <>
      {/* Mission hero */}
      <section className="bg-white py-20">
        <Container className="max-w-3xl text-center">
          <SectionHeading
            label="Our Mission"
            title={
              <>
                We turn learning into a game{' '}
                <span className="text-primary">worth winning</span>
              </>
            }
            subtitle="CompeteIQ started in a single classroom that wanted a fairer, more exciting way to run tests. Today we help institutes everywhere host competitions that students genuinely look forward to."
          />
        </Container>
      </section>

      <StatsStrip />

      {/* Values */}
      <section className="bg-surface-2 py-20">
        <Container>
          <SectionHeading label="What We Value" title="Principles behind every release" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <v.icon size={20} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-text-primary">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{v.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Story */}
      <section className="bg-white py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            center={false}
            label="Our Story"
            title="From one classroom to hundreds of institutes"
          />
          <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
            <p>
              In 2023, a small group of teachers and engineers were frustrated by clunky exam
              software that students dreaded and admins fought with. They believed assessment could
              feel less like a chore and more like a tournament.
            </p>
            <p>
              The first version of CompeteIQ ran a single live quiz with a real-time leaderboard.
              Participation doubled overnight. Word spread between schools, and the platform grew to
              support classes, teachers, AI-generated question banks, badges, and certificates.
            </p>
            <p>
              Today CompeteIQ powers competitions for institutes of every size — but the goal hasn't
              changed: make learning something students want to win at.
            </p>
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="bg-surface-2 py-20">
        <Container>
          <SectionHeading label="Our Team" title="The people building CompeteIQ" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div
                key={m.name}
                className="flex flex-col items-center rounded-xl border border-border bg-white p-6 text-center"
              >
                <Avatar name={m.name} size="xl" />
                <h3 className="mt-4 text-base font-semibold text-text-primary">{m.name}</h3>
                <p className="mt-1 text-sm text-text-muted">{m.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
