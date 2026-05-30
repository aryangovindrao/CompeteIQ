'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn, copyToClipboard } from '@/lib/utils';

export function JoinCode({
  code,
  className,
  size = 'md',
}: {
  code: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'group inline-flex items-center gap-2 rounded-md border border-border bg-surface-2 font-mono font-semibold tracking-wider text-text-primary transition-colors hover:border-primary/40 hover:bg-primary-light',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        className,
      )}
      title="Copy join code"
    >
      <span>{code}</span>
      <span className="relative inline-flex h-4 w-4 items-center justify-center text-text-muted group-hover:text-primary">
        {copied ? (
          <Check size={14} className="text-success" />
        ) : (
          <Copy size={14} />
        )}
      </span>
      {copied && (
        <span className="ml-0.5 text-[11px] font-medium text-success">Copied!</span>
      )}
    </button>
  );
}
