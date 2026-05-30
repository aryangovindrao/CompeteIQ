import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, notFound, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeQuestion } from '@/lib/server/serializers';

export const GET = handle(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireUser(req);
    const comp = await prisma.competition.findUnique({ where: { id: params.id } });
    if (!comp) return notFound('Competition not found');
    const rows = await prisma.question.findMany({
      where: { competitionId: params.id },
      include: { options: true },
      orderBy: { order: 'asc' },
    });
    return ok(rows.map((q) => serializeQuestion(q, false)));
  },
);
