'use client';

import { cn } from '@/lib/utils';

export function Slider({
  value,
  min = 1,
  max = 20,
  step = 1,
  onChange,
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn('h-2 w-full cursor-pointer appearance-none rounded-full outline-none', className)}
      style={{
        background: `linear-gradient(to right, #C0392B 0%, #C0392B ${pct}%, #E5E7EB ${pct}%, #E5E7EB 100%)`,
      }}
    />
  );
}
