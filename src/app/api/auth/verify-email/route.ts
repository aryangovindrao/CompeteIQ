import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handle } from '@/lib/server/http';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Email verification landing. The verification email links here.
 * On success → redirects to /login?verified=1.
 * On failure → redirects to /login?verify_error=1.
 */
export const GET = handle(async (req: NextRequest) => {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(`${APP_URL}/login?verify_error=1`);

  const user = await prisma.user.findUnique({ where: { verifyToken: token } });
  if (!user || !user.verifyTokenExpires || user.verifyTokenExpires < new Date()) {
    return NextResponse.redirect(`${APP_URL}/login?verify_error=1`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null, verifyTokenExpires: null },
  });

  return NextResponse.redirect(`${APP_URL}/login?verified=1`);
});
