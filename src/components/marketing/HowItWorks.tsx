import { Container, SectionHeading } from './Section';

const steps = [
  { n: 1, title: 'Register your institute', desc: 'Create your admin account and set up your institute profile in minutes.' },
  { n: 2, title: 'Invite teachers & students', desc: 'Share unique join codes. Teachers create classes; students enroll instantly.' },
  { n: 3, title: 'Create a competition', desc: 'Build a test by hand or generate questions with AI, then publish a join code.' },
  { n: 4, title: 'Go live & view results', desc: 'Run the competition live with real-time leaderboards and instant analytics.' },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <Container>
        <SectionHeading
          label="How It Works"
          title={<>Up and Running in <span className="text-primary">4 Steps</span></>}
          subtitle="From sign-up to your first live competition — no training required."
        />

        <div className="relative mt-14">
          {/* connector line (desktop) */}
          <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-primary/40 lg:block" />
          <div className="grid gap-10 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-card">
                  {s.n}
                </div>
                <h3 className="mt-4 text-base font-semibold text-text-primary">{s.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-text-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
