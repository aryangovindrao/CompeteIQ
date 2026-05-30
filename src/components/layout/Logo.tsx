import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full bg-primary text-white',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9V3h12v6" />
        <path d="M6 9a6 6 0 0012 0" />
        <path d="M9 21h6M12 15v6" />
      </svg>
    </span>
  );
}

export function Logo({
  href = '/',
  size = 32,
  showText = true,
  textClassName,
  className,
}: {
  href?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark size={size} />
      {showText && (
        <span className={cn('text-base font-bold tracking-tight text-text-primary', textClassName)}>
          CompeteIQ
        </span>
      )}
    </Link>
  );
}
