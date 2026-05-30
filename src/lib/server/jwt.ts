import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;       // user id
  role: Role;
  email: string;
  iat?: number;
  exp?: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET is not set or too short. Add a long random string to .env.local.');
  }
  return secret;
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d', algorithm: 'HS256' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret(), { algorithms: ['HS256'] }) as JwtPayload;
  } catch {
    return null;
  }
}
