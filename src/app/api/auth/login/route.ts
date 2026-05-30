import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/server/password';
import { signToken } from '@/lib/server/jwt';
import { handle, badRequest, unauthorized, ok } from '@/lib/server/http';
import { serializeUser } from '@/lib/server/serializers';
import { clientKey, limits } from '@/lib/server/rate-limit';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const POST = handle(async (req: NextRequest) => {
  // Rate limit: 5 attempts / 60s per IP.
  const rl = await limits.login.limit(clientKey(req, 'login'));
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Invalid email or password');

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { institute: true },
  });
  if (!user) return unauthorized('Invalid email or password');

  const okPw = await verifyPassword(password, user.passwordHash);
  if (!okPw) return unauthorized('Invalid email or password');

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return ok({ token, user: serializeUser(user) });
});
