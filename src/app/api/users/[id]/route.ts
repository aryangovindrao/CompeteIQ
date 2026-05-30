import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, notFound, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeUser } from '@/lib/server/serializers';

export const GET = handle(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireUser(req);
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { institute: true },
    });
    if (!user) return notFound('User not found');
    return ok(serializeUser(user));
  },
);
