import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { handle } from '@/lib/server/http';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Generates a random CSRF state cookie per request — never static.
export const dynamic = 'force-dynamic';

/**
 * Starts the Google OAuth flow. Redirects to Google's consent screen.
 * The callback (/api/auth/google/callback) finishes the exchange.
 */
export const GET = handle(async () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${APP_URL}/login?oauth_error=not_configured`);
  }

  const state = randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  const res = NextResponse.redirect(url);
  // Cookie-based CSRF guard verified in the callback.
  res.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return res;
});
