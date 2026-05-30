import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, notFound, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeCompetition } from '@/lib/server/serializers';

export const GET = handle(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = await requireUser(req);
    const c = await prisma.competition.findUnique({
      where: { id: params.id },
      include: {
        institute: { select: { name: true } },
        createdBy: { select: { name: true } },
        _count: { select: { questions: true, attempts: true } },
        attempts: { where: { userId: user.id }, take: 1 },
      },
    });
    if (!c) return notFound('Competition not found');
    return ok(serializeCompetition(c, user.id));
  },
);
