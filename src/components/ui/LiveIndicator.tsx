import { cn } from '@/lib/utils';

export function LiveIndicator({
  status,
  className,
}: {
  status: 'connected' | 'reconnecting' | 'disconnected';
  className?: string;
}) {
  const map = {
    connected: { label: 'Live', dot: 'bg-primary', text: 'text-primary', ring: 'border-primary/30 bg-primary-light' },
    reconnecting: { label: 'Reconnecting…', dot: 'bg-warning', text: 'text-warning', ring: 'border-warning/30 bg-[#FEF3C7]' },
    disconnected: { label: 'Offline', dot: 'bg-text-muted', text: 'text-text-muted', ring: 'border-border bg-surface-2' },
  }[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        map.ring,
        map.text,
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        {status === 'connected' && (
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', map.dot)} />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', map.dot)} />
      </span>
      {map.label}
    </span>
  );
}
