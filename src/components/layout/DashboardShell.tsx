'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useUIStore } from '@/lib/store';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileDrawer } from './MobileDrawer';
import { Spinner } from '@/components/ui/Spinner';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  // Client-side guard (complements middleware.ts).
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2">
        <Spinner className="h-7 w-7 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-2">
      <Sidebar />
      <MobileDrawer />
      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-14' : 'lg:pl-52')}>
        <Topbar />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
