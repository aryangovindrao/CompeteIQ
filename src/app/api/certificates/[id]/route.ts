import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { handle, notFound } from '@/lib/server/http';
import { renderCertificatePdf } from '@/lib/server/pdf';

export const runtime = 'nodejs';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Renders the certificate PDF on demand from DB state. Public by design — the
 * URL doubles as a shareable link. Set ?download=1 for an attachment header.
 */
export const GET = handle(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const cert = await prisma.certificate.findUnique({
      where: { id: params.id },
      include: {
        competition: { select: { title: true } },
        user: { include: { institute: true } },
      },
    });
    if (!cert) return notFound('Certificate not found');

    const pdf = await renderCertificatePdf({
      certificateId: cert.id,
      studentName: cert.user.name,
      competitionTitle: cert.competition.title,
      score: cert.score,
      rank: cert.rank,
      issuedAt: cert.issuedAt,
      institutionName: cert.user.institute.name,
      signerName: 'CompeteIQ Admissions Office',
      signerRole: cert.user.institute.name,
      verifyUrl: `${APP_URL}/verify/${cert.id}`,
    });

    const download = req.nextUrl.searchParams.get('download') === '1';
    const filename = `competeiq-${cert.id}.pdf`.replace(/[^a-z0-9.-]/gi, '_');

    return new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
);
