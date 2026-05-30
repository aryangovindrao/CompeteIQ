import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/server/http';
import { serializePackage } from '@/lib/server/serializers';

export const GET = handle(async () => {
  const rows = await prisma.package.findMany({ orderBy: { priceMonthly: 'asc' } });
  return ok(rows.map(serializePackage));
});
