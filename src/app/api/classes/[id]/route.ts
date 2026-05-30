import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, notFound, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeClass } from '@/lib/server/serializers';

export const GET = handle(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireUser(req);
    const c = await prisma.classRoom.findUnique({
      where: { id: params.id },
      include: {
        teacher: { select: { name: true } },
        _count: { select: { enrollments: true, competitions: true } },
      },
    });
    if (!c) return notFound('Class not found');
    return ok(serializeClass(c));
  },
);
