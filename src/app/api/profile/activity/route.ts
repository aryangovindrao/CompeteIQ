import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';

export const GET = handle(async (req: NextRequest) => {
  const user = await requireUser(req);
  const rows = await prisma.activityEvent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 25,
  });
  return ok(
    rows.map((e) => ({
      id: e.id,
      date: e.createdAt.toISOString(),
      type: e.type,
      text: e.text,
    })),
  );
});
