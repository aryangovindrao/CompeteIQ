import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyToken } from './jwt';
import { HttpError } from './http';

const TOKEN_COOKIE = 'competeiq_token';

function extractToken(req?: NextRequest): string | null {
  if (req) {
    // Authorization: Bearer <token>
    const auth = req.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) return auth.slice(7).trim();
    // Cookie (matches frontend tokenStore)
    const cookie = req.cookies.get(TOKEN_COOKIE)?.value;
    if (cookie) return cookie;
  }
  // Falls back to the framework cookie store (RSC / route handlers).
  try {
    return cookies().get(TOKEN_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

/** Resolve the current user from the request, or return null. */
export async function getCurrentUser(req?: NextRequest) {
  const token = extractToken(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { institute: true },
  });
  return user;
}

/** Require an authenticated user, throwing a 401 HttpError otherwise. */
export async function requireUser(req?: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) throw new HttpError(401, 'Not authenticated');
  return user;
}

/** Require one of the given roles. Throws 403 otherwise. */
export async function requireRole(req: NextRequest | undefined, ...roles: Role[]) {
  const user = await requireUser(req);
  if (!roles.includes(user.role)) {
    throw new HttpError(403, 'You don’t have permission to do that');
  }
  return user;
}

export function isStaff(role: Role) {
  return role === 'teacher' || role === 'institute_admin';
}
