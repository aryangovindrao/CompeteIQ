'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  PanelLeftClose,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useUIStore } from '@/lib/store';
import { Logo, LogoMark } from './Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import { roleLabels, visibleGroups, type NavItem } from './nav-config';

function isActivePath(pathname: string, href: string): boolean {
  const clean = href.split('?')[0];
  if (clean === '/dashboard') return pathname === '/dashboard';
  return pathname === clean || pathname.startsWith(`${clean}/`);
}

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-0',
        active
          ? 'bg-primary-light text-primary'
          : 'text-text-secondary hover:bg-surface-2 hover:text-primary',
      )}
    >
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
      )}
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip label={item.label} side="right">
        {content}
      </Tooltip>
    );
  }
  return content;
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar, learnGroupOpen, toggleLearnGroup } =
    useUIStore();
  const collapsed = sidebarCollapsed;
  const groups = visibleGroups(user?.role ?? 'student');

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="relative flex h-16 items-center border-b border-border px-4">
        {collapsed ? <LogoMark /> : <Logo href="/dashboard" />}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-text-secondary shadow-sm transition-colors hover:text-primary lg:flex"
          aria-label="Collapse sidebar"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 no-scrollbar">
        {groups.map((group, gi) => {
          const isLearn = group.label === 'Learn';
          const showItems = !isLearn || learnGroupOpen || collapsed;
          return (
            <div key={group.label ?? `g-${gi}`}>
              {group.label && !collapsed && (
                <button
                  onClick={isLearn ? toggleLearnGroup : undefined}
                  className={cn(
                    'mb-1 flex w-full items-center justify-between px-3 py-1',
                    !group.collapsible && 'pointer-events-none',
                  )}
                >
                  <span className="ui-label text-text-muted">{group.label}</span>
                  {group.collapsible && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        'text-text-muted transition-transform',
                        !learnGroupOpen && '-rotate-90',
                      )}
                    />
                  )}
                </button>
              )}
              {group.label && collapsed && gi > 0 && (
                <div className="mx-auto mb-2 h-px w-6 bg-border" />
              )}
              {showItems && (
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.label + item.href}
                      item={item}
                      collapsed={collapsed}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Tooltip label={user?.name ?? 'Profile'} side="right">
              <Link href="/profile">
                <Avatar name={user?.name ?? 'U'} size="sm" />
              </Link>
            </Tooltip>
            <Tooltip label="Logout" side="right">
              <button
                onClick={logout}
                className="rounded-md p-2 text-text-secondary hover:bg-surface-2 hover:text-danger"
              >
                <LogOut size={16} />
              </button>
            </Tooltip>
          </div>
        ) : (
          <div className="rounded-lg bg-surface-2 p-2.5">
            <Link
              href="/profile"
              onClick={onNavigate}
              className="flex items-center gap-2.5"
            >
              <Avatar name={user?.name ?? 'U'} src={user?.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {user?.name ?? 'User'}
                </p>
                <Badge tone="primary" className="mt-0.5 px-1.5 py-0 text-[10px]">
                  {roleLabels[user?.role ?? 'student']}
                </Badge>
              </div>
            </Link>
            <button
              onClick={logout}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-white px-2 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-danger/30 hover:text-danger"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Desktop fixed sidebar. */
export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden border-r border-border transition-[width] duration-200 lg:block',
        collapsed ? 'w-14' : 'w-52',
      )}
    >
      <SidebarContent />
    </aside>
  );
}

export { PanelLeftClose };
