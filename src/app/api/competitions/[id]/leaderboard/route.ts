import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';

export const GET = handle(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const me = await requireUser(req);
    const rows = await prisma.attempt.findMany({
      where: { competitionId: params.id },
      orderBy: [{ score: 'desc' }, { timeTakenSec: 'asc' }],
      take: 50,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, instituteId: true, streakDays: true, xpTotal: true, institute: { select: { name: true } } } },
      },
    });
    const badgeCounts = await prisma.userBadge.groupBy({
      by: ['userId'],
      _count: { userId: true },
      where: { userId: { in: rows.map((r) => r.userId) } },
    });
    const badgeMap = new Map(badgeCounts.map((b) => [b.userId, b._count.userId]));

    return ok(
      rows.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: r.user.name,
        avatarUrl: r.user.avatarUrl ?? undefined,
        instituteName: r.user.institute.name,
        xpTotal: r.user.xpTotal,
        badgeCount: badgeMap.get(r.userId) ?? 0,
        streakDays: r.user.streakDays,
        score: r.percentage,
        timeTakenSec: r.timeTakenSec,
        isCurrentUser: r.userId === me.id,
      })),
    );
  },
);
