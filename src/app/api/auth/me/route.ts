import type { NextRequest } from 'next/server';
import { handle, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import { serializeUser } from '@/lib/server/serializers';

export const GET = handle(async (req: NextRequest) => {
  const user = await requireUser(req);
  return ok(serializeUser(user));
});
