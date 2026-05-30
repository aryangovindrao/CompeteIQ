'use client';

import { cn } from '@/lib/utils';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  count?: number;
}

/** Underline-style tabs (profile, class detail). */
export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto border-b border-border no-scrollbar', className)}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              'relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
              active ? 'text-primary' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {it.label}
            {typeof it.count === 'number' && (
              <span className="ml-1.5 rounded-full bg-surface-2 px-1.5 py-0.5 text-[11px] text-text-secondary">
                {it.count}
              </span>
            )}
            {active && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Pill-style segmented control (filters, monthly/annual). */
export function PillTabs({
  items,
  value,
  onChange,
  className,
  size = 'md',
}: {
  items: TabItem[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-white p-1',
        className,
      )}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              'rounded-full font-medium transition-colors',
              size === 'sm' ? 'px-3 py-1 text-[13px]' : 'px-4 py-1.5 text-sm',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
