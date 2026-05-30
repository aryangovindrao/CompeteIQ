import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeClassStudent } from '@/lib/server/serializers';

export const GET = handle(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireUser(req);
    const rows = await prisma.classEnrollment.findMany({
      where: { classId: params.id },
      include: { user: true },
      orderBy: { user: { xpTotal: 'desc' } },
    });
    return ok(rows.map(serializeClassStudent));
  },
);
