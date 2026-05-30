import Link from 'next/link';
import { LogoMark } from './Logo';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'AI Generator', href: '/#gamification' },
      { label: 'Leaderboards', href: '/#features' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/about' },
      { label: 'Blog', href: '/about' },
      { label: 'Contact', href: '/about' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#111] text-text-muted">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="text-base font-bold text-white">CompeteIQ</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              The complete platform for hosting live competitions, gamified
              learning, and AI-powered assessments.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="ui-label text-text-muted">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm sm:flex-row">
          <p>© 2025 CompeteIQ. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <span className="opacity-40">·</span>
            <Link href="#" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
