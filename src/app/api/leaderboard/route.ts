import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req: NextRequest) => {
  const me = await requireUser(req);
  const scope = req.nextUrl.searchParams.get('scope') === 'institute' ? 'institute' : 'global';

  const users = await prisma.user.findMany({
    where: scope === 'institute' ? { instituteId: me.instituteId } : undefined,
    include: {
      institute: { select: { name: true } },
      userBadges: { select: { id: true } },
    },
    orderBy: { xpTotal: 'desc' },
    take: 50,
  });

  return ok(
    users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl ?? undefined,
      instituteName: u.institute.name,
      xpTotal: u.xpTotal,
      badgeCount: u.userBadges.length,
      streakDays: u.streakDays,
      isCurrentUser: u.id === me.id,
    })),
  );
});
