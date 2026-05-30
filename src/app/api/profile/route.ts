import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, badRequest, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeUser } from '@/lib/server/serializers';

export const GET = handle(async (req: NextRequest) => {
  const user = await requireUser(req);
  return ok(serializeUser(user));
});

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(280).optional(),
  phone: z.string().max(40).optional(),
  avatarUrl: z.string().url().optional(),
});

export const PATCH = handle(async (req: NextRequest) => {
  const user = await requireUser(req);
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return badRequest('Validation failed', parsed.error.flatten());
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    include: { institute: true },
  });
  return ok(serializeUser(updated));
});
