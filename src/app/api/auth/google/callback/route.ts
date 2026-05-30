import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/server/password';
import { signToken } from '@/lib/server/jwt';
import { handle } from '@/lib/server/http';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const dynamic = 'force-dynamic';

interface GoogleTokens {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}
interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  picture?: string;
}

export const GET = handle(async (req: NextRequest) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${APP_URL}/login?oauth_error=not_configured`);
  }

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const cookieState = req.cookies.get('google_oauth_state')?.value;
  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(`${APP_URL}/login?oauth_error=bad_state`);
  }

  // Exchange code → tokens.
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${APP_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.redirect(`${APP_URL}/login?oauth_error=exchange_failed`);
  }
  const tokens = (await tokenRes.json()) as GoogleTokens;

  // Fetch user info.
  const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) {
    return NextResponse.redirect(`${APP_URL}/login?oauth_error=userinfo_failed`);
  }
  const info = (await infoRes.json()) as GoogleUserInfo;
  if (!info.email || !info.verified_email) {
    return NextResponse.redirect(`${APP_URL}/login?oauth_error=unverified`);
  }
  const emailLower = info.email.toLowerCase();
  const domain = emailLower.split('@')[1];

  // Find existing user by googleId → email → create new.
  let user = await prisma.user.findUnique({
    where: { googleId: info.id },
    include: { institute: true },
  });

  if (!user) {
    user = await prisma.user.findUnique({
      where: { email: emailLower },
      include: { institute: true },
    });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: info.id, emailVerified: true, avatarUrl: user.avatarUrl ?? info.picture },
        include: { institute: true },
      });
    }
  }

  if (!user) {
    // Create new user — derive institute by email domain.
    const institute =
      (await prisma.institute.findUnique({ where: { domain } })) ??
      (await prisma.institute.create({
        data: { name: `${domain.split('.')[0]} workspace`, domain, plan: 'free' },
      }));
    // First account in a new institute → admin; otherwise student.
    const existingInInstitute = await prisma.user.count({ where: { instituteId: institute.id } });
    const role = existingInInstitute === 0 ? 'institute_admin' : 'student';
    // Generate an unguessable placeholder password — OAuth users never use it.
    const placeholderHash = await hashPassword(`google-oauth-${info.id}-${Date.now()}`);
    user = await prisma.user.create({
      data: {
        instituteId: institute.id,
        role,
        email: emailLower,
        name: info.name,
        avatarUrl: info.picture,
        passwordHash: placeholderHash,
        googleId: info.id,
        emailVerified: true,
      },
      include: { institute: true },
    });
    // Free subscription scaffold.
    if (role === 'institute_admin') {
      const freePkg = await prisma.package.findUnique({ where: { name: 'free' } });
      if (freePkg) {
        await prisma.subscription.create({
          data: {
            instituteId: institute.id,
            packageId: freePkg.id,
            planName: 'free',
            status: 'active',
            validUntil: new Date(Date.now() + 30 * 86400_000),
          },
        });
      }
    }
  }

  const jwt = signToken({ sub: user.id, role: user.role, email: user.email });

  // Mirror to cookie so middleware lets them in; the /auth/callback page
  // hydrates localStorage from /api/auth/me right after.
  const res = NextResponse.redirect(`${APP_URL}/auth/callback`);
  res.cookies.set('competeiq_token', jwt, {
    httpOnly: false, // existing frontend reads it client-side
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set('google_oauth_state', '', { path: '/', maxAge: 0 });
  return res;
});
