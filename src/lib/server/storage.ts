import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicUrl = process.env.R2_PUBLIC_URL;

const configured = !!(accountId && accessKeyId && secretAccessKey && bucket);

let client: S3Client | null = null;
function getClient(): S3Client | null {
  if (!configured) return null;
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    });
  }
  return client;
}

export function isStorageConfigured(): boolean {
  return configured;
}

export function publicUrlFor(key: string): string {
  if (publicUrl) return `${publicUrl.replace(/\/$/, '')}/${key}`;
  // Fallback: R2 dev URL pattern. Replace with your custom domain in prod.
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
}

/**
 * Generates a unique storage key under a logical folder.
 * Example: storageKey('avatars', 'user-123', '.png') → 'avatars/user-123/abcdef.png'
 */
export function storageKey(folder: string, scope: string, ext: string): string {
  const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
  const id = randomBytes(8).toString('hex');
  return `${folder}/${scope}/${id}${safeExt}`;
}

/**
 * Returns a presigned PUT URL the browser can upload directly to.
 * The frontend never sends bytes through this server — Cloudflare receives them.
 */
export async function presignPut(opts: {
  key: string;
  contentType: string;
  expiresInSec?: number;
}): Promise<string> {
  const c = getClient();
  if (!c) throw new Error('File storage is not configured.');
  return getSignedUrl(
    c,
    new PutObjectCommand({
      Bucket: bucket!,
      Key: opts.key,
      ContentType: opts.contentType,
    }),
    { expiresIn: opts.expiresInSec ?? 60 * 5 },
  );
}

export async function deleteObject(key: string): Promise<void> {
  const c = getClient();
  if (!c) return;
  await c.send(new DeleteObjectCommand({ Bucket: bucket!, Key: key }));
}
