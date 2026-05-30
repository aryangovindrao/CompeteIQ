import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeInvoice } from '@/lib/server/serializers';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req: NextRequest) => {
  const me = await requireUser(req);
  const rows = await prisma.invoice.findMany({
    where: { instituteId: me.instituteId },
    orderBy: { date: 'desc' },
  });
  return ok(rows.map(serializeInvoice));
});
