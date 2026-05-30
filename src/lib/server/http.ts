import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function unauthorized(message = 'Not authenticated') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = 'Internal server error', err?: unknown) {
  if (err) console.error('[api]', message, err);
  return NextResponse.json({ error: message }, { status: 500 });
}

/** Wraps a route handler to convert thrown errors into clean JSON responses. */
export function handle<T extends unknown[]>(
  fn: (...args: T) => Promise<Response> | Response,
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return badRequest('Validation failed', err.flatten());
      }
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      return serverError('Internal server error', err);
    }
  };
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
