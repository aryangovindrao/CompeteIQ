'use client';

import { Award, Globe, ScrollText, Trophy } from 'lucide-react';
import { useCertificates } from '@/lib/hooks';
import { PageHeader, CertificateCard } from '@/components/dashboard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/Button';

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-card">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xl font-bold leading-none text-text-primary">{value}</p>
        <p className="mt-1 text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

export function CertificatesView() {
  const { data: certificates, isLoading } = useCertificates();

  const certs = certificates ?? [];
  const publicCount = certs.filter((c) => c.isPublic).length;
  const avgScore = certs.length
    ? Math.round(certs.reduce((sum, c) => sum + c.score, 0) / certs.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        subtitle="Every competition you passed earns a shareable certificate of achievement."
      />

      {isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </>
      ) : certs.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryTile icon={<Award size={18} />} label="Total certificates" value={`${certs.length}`} />
            <SummaryTile icon={<Globe size={18} />} label="Public" value={`${publicCount}`} />
            <SummaryTile icon={<Trophy size={18} />} label="Average score" value={`${avgScore}%`} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certs.map((c) => (
              <CertificateCard key={c.id} certificate={c} isOwner />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<ScrollText size={22} />}
          title="No certificates yet"
          description="Finish a competition above its pass mark to earn your first certificate."
          action={
            <LinkButton href="/competitions" leftIcon={<Trophy size={15} />}>
              Browse competitions
            </LinkButton>
          }
        />
      )}
    </div>
  );
}
