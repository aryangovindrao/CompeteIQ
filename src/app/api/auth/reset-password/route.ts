import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/server/password';
import { handle, badRequest, ok } from '@/lib/server/http';

const schema = z.object({
  otp: z.string().length(6),
  password: z.string().min(8),
});

export const POST = handle(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Invalid reset request');

  const { otp, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      resetOtp: otp,
      resetOtpExpires: { gt: new Date() },
    },
  });
  if (!user) return ok({ ok: false });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(password),
      resetOtp: null,
      resetOtpExpires: null,
    },
  });

  return ok({ ok: true });
});
