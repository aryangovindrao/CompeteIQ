import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Award, BadgeCheck, Calendar, Download, ExternalLink, Medal, Trophy } from 'lucide-react';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';

interface PageProps {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps) {
  const cert = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: { competition: { select: { title: true } }, user: { select: { name: true } } },
  });
  if (!cert) return { title: 'Certificate not found · CompeteIQ' };
  return {
    title: `${cert.user.name} — ${cert.competition.title} · CompeteIQ`,
    description: `Verified certificate of achievement from CompeteIQ.`,
  };
}

/**
 * Public verification page — anyone with the link (e.g. employers) can confirm
 * the certificate is authentic. No auth required.
 */
export default async function VerifyCertificatePage({ params }: PageProps) {
  const cert = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: {
      competition: { select: { title: true, difficulty: true } },
      user: { include: { institute: { select: { name: true, domain: true } } } },
    },
  });

  if (!cert) notFound();

  const pdfHref = `/api/certificates/${cert.id}`;
  const downloadHref = `${pdfHref}?download=1`;

  return (
    <div className="min-h-screen bg-surface-2 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-primary"
        >
          COMPETEIQ
        </Link>

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          {/* Verified banner */}
          <div className="flex items-center gap-3 border-b border-success/30 bg-success/10 px-6 py-3">
            <BadgeCheck size={20} className="text-success" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Verified authentic</p>
              <p className="text-xs text-text-secondary">
                This certificate was issued by {cert.user.institute.name} through CompeteIQ.
              </p>
            </div>
          </div>

          <div className="px-8 py-10 text-center sm:px-12 sm:py-12">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-card">
              <Award size={26} />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-text-muted">
              Certificate of Achievement
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {cert.competition.title}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Awarded to <span className="font-semibold text-text-primary">{cert.user.name}</span>
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {cert.user.institute.name}
              {cert.user.institute.domain && (
                <span className="ml-2 text-text-muted">· {cert.user.institute.domain}</span>
              )}
            </p>

            <div className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-surface-2 p-4">
                <Trophy size={16} className="mx-auto text-primary" />
                <p className="mt-2 text-xl font-bold text-text-primary">{cert.score}%</p>
                <p className="text-xs text-text-muted">Final score</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-4">
                <Medal size={16} className="mx-auto" style={{ color: '#D4A017' }} />
                <p className="mt-2 text-xl font-bold text-text-primary">#{cert.rank}</p>
                <p className="text-xs text-text-muted">Rank</p>
              </div>
              <div className="col-span-2 rounded-lg border border-border bg-surface-2 p-4 sm:col-span-1">
                <Calendar size={16} className="mx-auto text-text-secondary" />
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {formatDate(cert.issuedAt)}
                </p>
                <p className="text-xs text-text-muted">Issued</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-text-primary hover:bg-surface-2"
              >
                <ExternalLink size={15} /> View PDF
              </a>
              <a
                href={downloadHref}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                <Download size={15} /> Download PDF
              </a>
            </div>
          </div>

          <div className="border-t border-border bg-surface-2 px-6 py-4 text-center text-xs text-text-muted">
            Certificate ID: <span className="font-mono">{cert.id}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-text-muted">
          Verification is automatic — anyone with this link can confirm authenticity. Tamper or
          forgery is not possible because PDFs are rendered server-side from our records.
        </p>
      </div>
    </div>
  );
}
