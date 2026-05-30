import { cn, clamp } from '@/lib/utils';

export function Progress({
  value,
  max = 100,
  className,
  variant = 'primary',
  size = 'md',
}: {
  value: number;
  max?: number;
  className?: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md';
}) {
  const pct = clamp((value / max) * 100, 0, 100);
  const fill = {
    primary: 'bg-primary',
    success: 'bg-success',
    danger: 'bg-danger',
    warning: 'bg-warning',
  }[variant];
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-border',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** SVG circular progress used by dashboard "My Progress" card. */
export function CircularProgress({
  value,
  max = 100,
  size = 120,
  stroke = 10,
  trackClass = 'text-white/15',
  fillClass = 'text-white',
  children,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  trackClass?: string;
  fillClass?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = clamp((value / max) * 100, 0, 100);
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={trackClass}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn('transition-all duration-700', fillClass)}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
