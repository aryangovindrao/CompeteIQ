'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { Button, LinkButton } from '@/components/ui/Button';

const links = [
  { href: '/', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-white/90 backdrop-blur transition-shadow',
        scrolled ? 'border-b border-border shadow-sm' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm text-text-secondary transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LinkButton href="/login" variant="ghost">
            Sign In
          </LinkButton>
          <LinkButton href="/register">Get Started</LinkButton>
        </div>

        <button
          className="rounded-md p-2 text-text-primary md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile slide-down */}
      <div
        className={cn(
          'overflow-hidden border-t border-border bg-white transition-[max-height] duration-300 md:hidden',
          open ? 'max-h-96' : 'max-h-0',
        )}
      >
        <div className="space-y-1 px-4 py-3">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <LinkButton href="/login" variant="secondary" fullWidth>
              Sign In
            </LinkButton>
            <LinkButton href="/register" fullWidth>
              Get Started
            </LinkButton>
          </div>
        </div>
      </div>
    </header>
  );
}
