import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, notFound, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeAttempt } from '@/lib/server/serializers';

export const GET = handle(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = await requireUser(req);
    const attempt = await prisma.attempt.findUnique({
      where: { userId_competitionId: { userId: user.id, competitionId: params.id } },
      include: {
        competition: { select: { title: true } },
        user: { select: { name: true } },
        answers: { include: { question: true } },
      },
    });
    if (!attempt) return notFound('No attempt yet — finish the competition first');
    return ok(serializeAttempt(attempt));
  },
);
