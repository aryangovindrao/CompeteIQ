import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';

export const GET = handle(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const me = await requireUser(req);
    const rows = await prisma.classEnrollment.findMany({
      where: { classId: params.id },
      include: {
        user: {
          include: {
            institute: { select: { name: true } },
            userBadges: { select: { id: true } },
          },
        },
      },
      orderBy: { user: { xpTotal: 'desc' } },
      take: 50,
    });

    return ok(
      rows.map((r, i) => ({
        rank: i + 1,
        userId: r.user.id,
        name: r.user.name,
        avatarUrl: r.user.avatarUrl ?? undefined,
        instituteName: r.user.institute.name,
        xpTotal: r.user.xpTotal,
        badgeCount: r.user.userBadges.length,
        streakDays: r.user.streakDays,
        isCurrentUser: r.user.id === me.id,
      })),
    );
  },
);
