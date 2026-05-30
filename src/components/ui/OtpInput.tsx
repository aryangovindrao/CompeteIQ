'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

export function OtpInput({
  length = 6,
  value,
  onChange,
  className,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.split('').concat(Array(length).fill('')).slice(0, length);

  const setChar = (i: number, c: string) => {
    const next = chars.slice();
    next[i] = c.slice(-1);
    onChange(next.join('').slice(0, length));
    if (c && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(text);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className={cn('flex justify-center gap-2', className)} onPaste={onPaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={chars[i]}
          onChange={(e) => setChar(i, e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => onKeyDown(i, e)}
          className="h-12 w-11 rounded-md border border-border bg-white text-center text-lg font-semibold text-text-primary transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      ))}
    </div>
  );
}
