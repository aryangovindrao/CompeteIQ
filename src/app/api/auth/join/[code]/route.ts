import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, notFound, ok } from '@/lib/server/http';

export const GET = handle(
  async (_req: NextRequest, { params }: { params: { code: string } }) => {
    const code = params.code.toUpperCase();

    const comp = await prisma.competition.findUnique({
      where: { joinCode: code },
      include: { institute: true, createdBy: true },
    });
    if (comp) {
      return ok({
        kind: 'competition',
        id: comp.id,
        name: comp.title,
        teacherName: comp.createdBy.name,
        instituteName: comp.institute.name,
        when: comp.startTime.toISOString(),
      });
    }

    const cls = await prisma.classRoom.findUnique({
      where: { joinCode: code },
      include: { institute: true, teacher: true },
    });
    if (cls) {
      return ok({
        kind: 'class',
        id: cls.id,
        name: cls.name,
        teacherName: cls.teacher.name,
        instituteName: cls.institute.name,
      });
    }

    return notFound('That code didn’t match a competition or class');
  },
);
