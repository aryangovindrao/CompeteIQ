import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeBadge } from '@/lib/server/serializers';

export const GET = handle(async (req: NextRequest) => {
  const user = await requireUser(req);
  const [allBadges, earned] = await Promise.all([
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId: user.id }, include: { badge: true } }),
  ]);
  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.awardedAt]));
  return ok(
    allBadges.map((b) => ({
      ...serializeBadge(b),
      earned: earnedMap.has(b.id),
      awardedAt: earnedMap.get(b.id)?.toISOString() ?? '',
    })),
  );
});
