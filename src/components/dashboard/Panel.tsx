import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('rounded-lg border border-border bg-white shadow-card', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-text-primary">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

/** "View all →" style link for panel headers. */
export function PanelLink({ href, children = 'View all' }: { href: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary-dark"
    >
      {children}
      <ChevronRight size={14} />
    </Link>
  );
}
