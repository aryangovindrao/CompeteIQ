'use client';

import { useEffect, useRef, useState } from 'react';

/** Animate a number from 0 → target over `duration` ms (ease-out). */
export function useCountUp(target: number, duration = 1200, start = true): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number>();
  const startedAt = useRef<number>();

  useEffect(() => {
    if (!start) return;
    startedAt.current = undefined;
    const step = (ts: number) => {
      if (startedAt.current === undefined) startedAt.current = ts;
      const elapsed = ts - startedAt.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration, start]);

  return value;
}
