import Link from 'next/link';
import { BarChart3, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

const trustPoints = [
  { icon: Trophy, title: 'Host any competition', desc: 'MCQ, coding, or subjective — live in minutes.' },
  { icon: BarChart3, title: 'Real-time leaderboards', desc: 'Students watch their rank update live.' },
  { icon: Sparkles, title: 'AI question generator', desc: 'Turn a syllabus PDF into a full test instantly.' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left brand panel */}
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-dark p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-radial-primary opacity-80" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative">
          <Logo href="/" textClassName="text-white" />
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight">
              Smarter competitions for every institute.
            </h2>
            <p className="mt-3 max-w-sm text-white/70">
              Join 500+ schools running live, gamified assessments on CompeteIQ.
            </p>
          </div>

          {/* Mini dashboard mock */}
          <div className="max-w-sm rounded-xl border border-white/10 bg-dark-2/80 p-4 shadow-modal backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <span className="ui-label text-white/50">Live Leaderboard</span>
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live
              </span>
            </div>
            {[
              { n: 'Aisha K.', xp: 980, w: '95%' },
              { n: 'Liam C.', xp: 910, w: '82%' },
              { n: 'Sofia G.', xp: 860, w: '74%' },
            ].map((r, i) => (
              <div key={i} className="mb-2 flex items-center gap-3 last:mb-0">
                <span className="w-4 text-sm font-bold text-white/60">{i + 1}</span>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-white/90">{r.n}</span>
                    <span className="text-white/60">{r.xp} XP</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-primary" style={{ width: r.w }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ul className="space-y-4">
            {trustPoints.map((t) => (
              <li key={t.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <t.icon size={17} className="text-primary" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.title}</p>
                  <p className="text-sm text-white/60">{t.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-white/50">
          <ShieldCheck size={15} /> SOC 2 compliant · Trusted by 500+ institutes
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col lg:w-3/5">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo href="/" />
          <Link href="/" className="text-sm text-text-secondary hover:text-primary">
            ← Back home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
