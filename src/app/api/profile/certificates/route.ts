import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeCertificate } from '@/lib/server/serializers';

export const GET = handle(async (req: NextRequest) => {
  const user = await requireUser(req);
  const rows = await prisma.certificate.findMany({
    where: { userId: user.id },
    include: {
      competition: { select: { title: true } },
      user: { select: { name: true } },
    },
    orderBy: { issuedAt: 'desc' },
  });
  return ok(rows.map(serializeCertificate));
});
