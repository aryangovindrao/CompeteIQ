import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeCompetition } from '@/lib/server/serializers';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req: NextRequest) => {
  const user = await requireUser(req);
  const rows = await prisma.competition.findMany({
    where: { instituteId: user.instituteId },
    include: {
      institute: { select: { name: true } },
      createdBy: { select: { name: true } },
      _count: { select: { questions: true, attempts: true } },
      attempts: { where: { userId: user.id }, take: 1 },
    },
    orderBy: { startTime: 'desc' },
  });
  return ok(rows.map((c) => serializeCompetition(c, user.id)));
});
