'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Award, Download, Globe, Lock } from 'lucide-react';
import type { Certificate } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';

export function CertificateCard({
  certificate,
  isOwner = false,
}: {
  certificate: Certificate;
  isOwner?: boolean;
}) {
  const [isPublic, setIsPublic] = useState(certificate.isPublic);

  const toggle = () => {
    setIsPublic((p) => !p);
    toast.success(isPublic ? 'Certificate set to private' : 'Certificate is now public');
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-card transition-shadow hover:shadow-hover">
      <div className="h-1.5 bg-gradient-to-r from-primary to-primary-dark" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light text-primary">
            <Award size={20} />
          </div>
          <Badge tone={isPublic ? 'green' : 'gray'} dot>
            {isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>

        <p className="ui-label mt-4 text-text-muted">Certificate of Achievement</p>
        <h3 className="mt-1 text-base font-semibold leading-snug text-text-primary">
          {certificate.competitionTitle}
        </h3>
        <p className="mt-0.5 text-sm text-text-secondary">Awarded to {certificate.userName}</p>

        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-xs text-text-muted">Score</p>
            <p className="text-lg font-bold text-text-primary">{certificate.score}%</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Rank</p>
            <p className="text-lg font-bold text-text-primary">#{certificate.rank}</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-text-muted">Issued {formatDate(certificate.issuedAt)}</p>

        <div className="mt-4 flex flex-1 items-end gap-2 pt-2">
          <LinkButton
            href={certificate.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="sm"
            leftIcon={<Download size={15} />}
          >
            Download
          </LinkButton>
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              leftIcon={isPublic ? <Lock size={15} /> : <Globe size={15} />}
            >
              {isPublic ? 'Make private' : 'Make public'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
