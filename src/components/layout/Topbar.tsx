'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronRight, LogOut, Menu, Search, Settings, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useUIStore } from '@/lib/store';
import { Avatar } from '@/components/ui/Avatar';
import { roleLabels } from './nav-config';
import { mockNotifications } from '@/lib/mock';

const titleMap: Record<string, string> = {
  dashboard: 'Dashboard',
  profile: 'Profile',
  classes: 'My Classes',
  competitions: 'Competitions',
  attempt: 'Attempt',
  results: 'Results',
  leaderboard: 'Leaderboard',
  certificates: 'Certificates',
  teachers: 'Teachers',
  students: 'Students',
  billing: 'Billing',
  'ai-generator': 'AI Generator',
};

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let acc = '';
  for (const seg of segments) {
    acc += `/${seg}`;
    const label =
      titleMap[seg] ??
      (seg.length > 12 ? `${seg.slice(0, 8)}…` : seg.replace(/-/g, ' '));
    crumbs.push({ label: label.replace(/\b\w/g, (c) => c.toUpperCase()), href: acc });
  }
  return crumbs;
}

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const crumbs = useBreadcrumbs();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const unread = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          className="rounded-md p-1.5 text-text-secondary hover:bg-surface-2 lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <nav className="flex min-w-0 items-center gap-1.5 text-sm">
          {crumbs.map((c, i) => (
            <span key={c.href} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} className="shrink-0 text-text-muted" />}
              {i === crumbs.length - 1 ? (
                <span className="truncate font-semibold text-text-primary">{c.label}</span>
              ) : (
                <Link href={c.href} className="truncate text-text-secondary hover:text-primary">
                  {c.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-1">
        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <input
              autoFocus
              onBlur={() => setSearchOpen(false)}
              placeholder="Search…"
              className="h-9 w-40 rounded-md border border-border bg-surface-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-56"
            />
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((o) => !o)}
            className="relative rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-lg border border-border bg-white shadow-hover">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-sm font-semibold">Notifications</span>
                <span className="text-xs text-text-muted">{unread} unread</span>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {mockNotifications.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      'flex gap-3 border-b border-border px-4 py-3 last:border-0',
                      !n.read && 'bg-primary-light/40',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        n.type === 'success' ? 'bg-success' : n.type === 'warning' ? 'bg-warning' : 'bg-primary',
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{n.title}</p>
                      <p className="text-xs text-text-secondary">{n.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Avatar dropdown */}
        <div className="relative ml-1" ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="Account menu">
            <Avatar name={user?.name ?? 'U'} src={user?.avatarUrl} size="sm" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 w-56 overflow-hidden rounded-lg border border-border bg-white py-1 shadow-hover">
              <div className="border-b border-border px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-text-primary">{user?.name}</p>
                <p className="truncate text-xs text-text-secondary">{user?.email}</p>
                <p className="mt-0.5 text-[11px] text-text-muted">{roleLabels[user?.role ?? 'student']}</p>
              </div>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-primary">
                <UserIcon size={15} /> Profile
              </Link>
              <Link href="/dashboard?view=settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-primary">
                <Settings size={15} /> Settings
              </Link>
              <button onClick={() => { setMenuOpen(false); logout(); }} className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-danger hover:bg-surface-2">
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
