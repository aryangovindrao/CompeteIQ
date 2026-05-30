import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

/**
 * Creates a sliding-window limiter. Falls back to an in-memory limiter
 * when Upstash isn't configured (single-instance only — fine for dev).
 */
export function createLimiter(opts: { name: string; limit: number; windowSec: number }) {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(opts.limit, `${opts.windowSec} s`),
      analytics: false,
      prefix: `rl:${opts.name}`,
    });
  }
  return memoryLimiter(opts.limit, opts.windowSec);
}

// --------- in-memory fallback ----------------------------------------------

interface MemoryBucket {
  hits: number[];
}
const buckets = new Map<string, MemoryBucket>();

function memoryLimiter(limit: number, windowSec: number) {
  return {
    limit: async (key: string) => {
      const now = Date.now();
      const cutoff = now - windowSec * 1000;
      const b = buckets.get(key) ?? { hits: [] };
      b.hits = b.hits.filter((t) => t > cutoff);
      const allowed = b.hits.length < limit;
      if (allowed) b.hits.push(now);
      buckets.set(key, b);
      return {
        success: allowed,
        limit,
        remaining: Math.max(0, limit - b.hits.length),
        reset: now + windowSec * 1000,
      };
    },
  };
}

// --------- helpers ----------------------------------------------------------

export function clientKey(req: NextRequest, suffix = ''): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return suffix ? `${ip}:${suffix}` : ip;
}

/** Pre-configured limiters for the most abusable endpoints. */
export const limits = {
  login: createLimiter({ name: 'login', limit: 5, windowSec: 60 }),
  register: createLimiter({ name: 'register', limit: 5, windowSec: 60 * 5 }),
  forgot: createLimiter({ name: 'forgot', limit: 3, windowSec: 60 * 10 }),
  ai: createLimiter({ name: 'ai', limit: 20, windowSec: 60 * 60 }),
};
