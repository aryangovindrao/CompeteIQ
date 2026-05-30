import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { handle, badRequest, ok, serverError } from '@/lib/server/http';
import { requireUser } from '@/lib/server/session';
import {
  isStorageConfigured,
  presignPut,
  publicUrlFor,
  storageKey,
} from '@/lib/server/storage';

const KIND_RULES: Record<
  string,
  { folder: string; allow: string[]; maxBytes: number }
> = {
  avatar: {
    folder: 'avatars',
    allow: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    maxBytes: 2 * 1024 * 1024, // 2MB
  },
  syllabus: {
    folder: 'syllabi',
    allow: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    maxBytes: 20 * 1024 * 1024, // 20MB
  },
};

const schema = z.object({
  kind: z.enum(['avatar', 'syllabus']),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
});

/**
 * Issues a presigned URL the client uses to PUT directly to R2.
 * Returns both the upload URL (one-time, expires in 5 min) and the
 * public URL the client should store afterwards.
 */
export const POST = handle(async (req: NextRequest) => {
  const user = await requireUser(req);
  if (!isStorageConfigured()) {
    return serverError('File storage is not configured on this server.');
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Invalid upload request', parsed.error.flatten());

  const rules = KIND_RULES[parsed.data.kind];
  if (!rules.allow.includes(parsed.data.contentType)) {
    return badRequest(`Unsupported file type: ${parsed.data.contentType}`);
  }
  if (parsed.data.size > rules.maxBytes) {
    return badRequest(
      `File too large. Max ${Math.round(rules.maxBytes / 1024 / 1024)}MB for ${parsed.data.kind}.`,
    );
  }

  const ext = parsed.data.filename.includes('.')
    ? parsed.data.filename.slice(parsed.data.filename.lastIndexOf('.'))
    : '';
  const key = storageKey(rules.folder, user.id, ext);
  const uploadUrl = await presignPut({ key, contentType: parsed.data.contentType });
  return ok({ uploadUrl, key, publicUrl: publicUrlFor(key) });
});
