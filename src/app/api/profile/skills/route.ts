import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

/**
 * Derives a skill radar by averaging the user's percentage across each subject.
 * Falls back to a small default scaffold for new users with no attempts yet.
 */
export const GET = handle(async (req: NextRequest) => {
  const user = await requireUser(req);

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    include: { competition: { include: { classroom: { select: { subject: true } } } } },
  });

  const buckets = new Map<string, { sum: number; count: number }>();
  for (const a of attempts) {
    const subject = a.competition.classroom?.subject ?? 'General';
    const cur = buckets.get(subject) ?? { sum: 0, count: 0 };
    cur.sum += a.percentage;
    cur.count += 1;
    buckets.set(subject, cur);
  }

  if (buckets.size === 0) {
    return ok([
      { subject: 'Math', score: 60, fullMark: 100 },
      { subject: 'Science', score: 55, fullMark: 100 },
      { subject: 'English', score: 70, fullMark: 100 },
      { subject: 'History', score: 50, fullMark: 100 },
      { subject: 'Coding', score: 65, fullMark: 100 },
    ]);
  }

  return ok(
    Array.from(buckets.entries()).map(([subject, { sum, count }]) => ({
      subject,
      score: Math.round(sum / count),
      fullMark: 100,
    })),
  );
});
