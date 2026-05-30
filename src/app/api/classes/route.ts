import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, badRequest, forbidden, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { generateJoinCode } from '@/lib/server/gamification';
import { serializeClass } from '@/lib/server/serializers';

export const GET = handle(async (req: NextRequest) => {
  const user = await requireUser(req);
  const rows = await prisma.classRoom.findMany({
    where: { instituteId: user.instituteId },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { enrollments: true, competitions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return ok(rows.map(serializeClass));
});

const createSchema = z.object({
  name: z.string().min(3),
  subject: z.string().min(2),
  description: z.string().optional().default(''),
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireUser(req);
  if (user.role !== 'teacher' && user.role !== 'institute_admin') {
    return forbidden('Only teachers and admins can create classes');
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest('Validation failed', parsed.error.flatten());

  // Ensure a unique join code (the random space is ~17.5M, retry on collision).
  let joinCode = generateJoinCode();
  for (let i = 0; i < 5; i++) {
    const dup = await prisma.classRoom.findUnique({ where: { joinCode } });
    if (!dup) break;
    joinCode = generateJoinCode();
  }

  const created = await prisma.classRoom.create({
    data: {
      instituteId: user.instituteId,
      teacherId: user.id,
      name: parsed.data.name,
      subject: parsed.data.subject,
      description: parsed.data.description,
      joinCode,
    },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { enrollments: true, competitions: true } },
    },
  });
  return ok(serializeClass(created), { status: 201 });
});
