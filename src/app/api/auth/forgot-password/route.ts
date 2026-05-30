import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/server/email';
import { handle, badRequest, ok } from '@/lib/server/http';
import { clientKey, limits } from '@/lib/server/rate-limit';

const schema = z.object({ email: z.string().email() });

/**
 * Generates a 6-digit OTP and emails it to the user via Resend.
 * Always returns { sent: true } regardless of whether the address exists,
 * so attackers can't enumerate registered emails.
 */
export const POST = handle(async (req: NextRequest) => {
  // Rate limit: 3 reset requests / 10 minutes per IP.
  const rl = await limits.forgot.limit(clientKey(req, 'forgot'));
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes.' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Please enter a valid email');

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (user) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpires: new Date(Date.now() + 15 * 60_000), // 15 min
      },
    });
    // Fire-and-forget so a slow SMTP doesn't slow the response.
    void sendPasswordResetEmail(user.email, user.name, otp);
  }

  return ok({ sent: true });
});
