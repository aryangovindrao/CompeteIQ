'use client';

import { useEffect, useState } from 'react';
import { countdownTo } from '../utils';

/** Live-ticking countdown to a target ISO date. */
export function useCountdown(target: string | Date) {
  const [state, setState] = useState(() => countdownTo(target));

  useEffect(() => {
    setState(countdownTo(target));
    const id = setInterval(() => setState(countdownTo(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return state;
}

/** Counts seconds down from an initial value to 0 (attempt timer). */
export function useTimer(initialSeconds: number, onExpire?: () => void) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          onExpire?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return remaining;
}
