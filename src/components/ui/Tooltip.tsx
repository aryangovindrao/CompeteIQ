'use client';

import { cn } from '@/lib/utils';

/** Lightweight CSS tooltip (used for collapsed sidebar icons). */
export function Tooltip({
  label,
  children,
  side = 'right',
  className,
}: {
  label: string;
  children: React.ReactNode;
  side?: 'right' | 'top' | 'bottom';
  className?: string;
}) {
  const pos = {
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  }[side];

  return (
    <span className={cn('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-dark px-2 py-1 text-xs font-medium text-white opacity-0 shadow-hover transition-opacity duration-150 group-hover/tt:opacity-100',
          pos,
        )}
      >
        {label}
      </span>
    </span>
  );
}
