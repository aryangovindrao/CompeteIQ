import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrendChip({
  value,
  suffix = 'this month',
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        up ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]',
        className,
      )}
    >
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? '+' : ''}
      {value}%{suffix ? <span className="hidden sm:inline">&nbsp;{suffix}</span> : null}
    </span>
  );
}
