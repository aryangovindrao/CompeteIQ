import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/server/password';
import { signToken } from '@/lib/server/jwt';
import { handle, badRequest, ok } from '@/lib/server/http';
import { serializeUser } from '@/lib/server/serializers';
import { sendVerificationEmail } from '@/lib/server/email';
import { clientKey, limits } from '@/lib/server/rate-limit';

const schema = z.object({
  instituteName: z.string().min(2),
  domain: z.string().min(3),
  country: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const POST = handle(async (req: NextRequest) => {
  // Rate limit: 5 signups / 5 minutes per IP.
  const rl = await limits.register.limit(clientKey(req, 'register'));
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please wait a few minutes.' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Validation failed', parsed.error.flatten());

  const { instituteName, domain, country, name, email, password } = parsed.data;
  const emailLower = email.toLowerCase();
  const domainLower = domain.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
  if (existing) return badRequest('An account with this email already exists');

  const passwordHash = await hashPassword(password);

  const { user } = await prisma.$transaction(async (tx) => {
    // Reuse an institute on the same domain if one exists, otherwise create it.
    const institute =
      (await tx.institute.findUnique({ where: { domain: domainLower } })) ??
      (await tx.institute.create({
        data: { name: instituteName, domain: domainLower, country, plan: 'free' },
      }));

    const verifyToken = randomBytes(32).toString('hex');
    const user = await tx.user.create({
      data: {
        instituteId: institute.id,
        role: 'institute_admin', // first signup for a domain becomes admin
        email: emailLower,
        name,
        passwordHash,
        verifyToken,
        verifyTokenExpires: new Date(Date.now() + 24 * 3600_000), // 24h
      },
      include: { institute: true },
    });

    // Bootstrap a free subscription so /billing has data.
    const freePkg = await tx.package.findUnique({ where: { name: 'free' } });
    if (freePkg && !(await tx.subscription.findUnique({ where: { instituteId: institute.id } }))) {
      await tx.subscription.create({
        data: {
          instituteId: institute.id,
          packageId: freePkg.id,
          planName: 'free',
          status: 'active',
          validUntil: new Date(Date.now() + 30 * 86400_000),
        },
      });
    }

    return { user };
  });

  if (user.verifyToken) {
    void sendVerificationEmail(user.email, user.name, user.verifyToken);
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return ok({ token, user: serializeUser(user) }, { status: 201 });
});
