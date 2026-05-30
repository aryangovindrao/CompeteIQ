import { Prisma, PrismaClient } from '@prisma/client';

// Prevent multiple PrismaClient instances during Next.js dev hot-reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Run a Prisma query with one transparent retry when the underlying connection
 * was killed by the server (Neon free tier auto-suspends after idle, which
 * surfaces as P1017 / E57P01 / "Connection terminated"). The second attempt
 * uses a fresh pool, so a sleeping branch wakes up cleanly.
 *
 * Most route handlers don't need this — Prisma already reconnects on the next
 * call — but for code paths where a single retry is materially nicer than a
 * 500 (e.g. background jobs, SSE re-snapshots), wrap the query in `withRetry`.
 */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isConnectionError(err)) throw err;
      // Brief backoff so Neon has a moment to wake up.
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr;
}

function isConnectionError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P1001 = can't reach DB, P1002 = timed out, P1017 = connection closed.
    return err.code === 'P1001' || err.code === 'P1002' || err.code === 'P1017';
  }
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientRustPanicError) return true;
  // Surface from the underlying pg client: "terminating connection due to
  // administrator command" (E57P01) and friends.
  const message = err instanceof Error ? err.message : String(err);
  return /terminating connection|Connection terminated|ECONNRESET|ETIMEDOUT|57P01/i.test(
    message,
  );
}
