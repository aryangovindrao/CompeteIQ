import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, notFound, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeSubscription } from '@/lib/server/serializers';

export const GET = handle(async (req: NextRequest) => {
  const me = await requireUser(req);
  const sub = await prisma.subscription.findUnique({
    where: { instituteId: me.instituteId },
    include: { package: true },
  });
  if (!sub) return notFound('No subscription found');

  const [competitionsUsed, teachersUsed, studentsUsed] = await Promise.all([
    prisma.competition.count({ where: { instituteId: me.instituteId } }),
    prisma.user.count({ where: { instituteId: me.instituteId, role: 'teacher' } }),
    prisma.user.count({ where: { instituteId: me.instituteId, role: 'student' } }),
  ]);

  return ok(
    serializeSubscription(sub, {
      competitionsUsed,
      competitionsLimit: sub.package.maxCompetitions,
      teachersUsed,
      teachersLimit: sub.package.maxTeachers,
      studentsUsed,
    }),
  );
});
