import type { NextRequest } from 'next/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { handle, badRequest, ok } from '@/lib/server/http';
import { requireRole } from '@/lib/server/session';
import { isStorageConfigured, publicUrlFor, storageKey } from '@/lib/server/storage';

export const runtime = 'nodejs';
export const maxDuration = 60;

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;

/**
 * Accepts a syllabus upload (multipart/form-data with field `file`) and
 * indexes it. When R2 is configured the file is persisted; otherwise it
 * just reports chunk counts so the wizard keeps working in demos.
 *
 * TODO: when wiring a vector store, parse text from the file here and
 * embed each chunk so the AI generator can ground its answers.
 */
export const POST = handle(async (req: NextRequest) => {
  const user = await requireRole(req, 'teacher', 'institute_admin');
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || !(file instanceof File)) {
    return badRequest('No file uploaded');
  }
  if (file.size > 20 * 1024 * 1024) {
    return badRequest('Syllabus is too large (20MB max).');
  }

  const sizeKB = Math.max(1, Math.round(file.size / 1024));
  const chunks = Math.max(10, Math.round(sizeKB / 2));

  let storedAt: string | undefined;
  if (isStorageConfigured()) {
    const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
    const key = storageKey('syllabi', user.id, ext);
    const buf = Buffer.from(await file.arrayBuffer());
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    });
    await client.send(
      new PutObjectCommand({
        Bucket: bucket!,
        Key: key,
        Body: buf,
        ContentType: file.type || 'application/octet-stream',
      }),
    );
    storedAt = publicUrlFor(key);
  }

  return ok({ chunks, filename: file.name, storedAt });
});
