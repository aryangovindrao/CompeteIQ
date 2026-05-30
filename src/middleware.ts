import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/classes',
  '/competitions',
  '/leaderboard',
  '/certificates',
  '/teachers',
  '/students',
  '/billing',
  '/ai-generator',
];

const AUTH_ROUTES = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('competeiq_token')?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in users skip the auth screens.
  if (token && AUTH_ROUTES.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/classes/:path*',
    '/competitions/:path*',
    '/leaderboard/:path*',
    '/certificates/:path*',
    '/teachers/:path*',
    '/students/:path*',
    '/billing/:path*',
    '/ai-generator/:path*',
    '/login',
    '/register',
  ],
};
