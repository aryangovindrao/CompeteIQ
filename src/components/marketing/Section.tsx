import { cn } from '@/lib/utils';

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('text-sm font-semibold uppercase tracking-[0.08em] text-primary', className)}>
      {children}
    </span>
  );
}

export function SectionHeading({
  label,
  title,
  subtitle,
  center = true,
  dark = false,
}: {
  label?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {label && <SectionLabel>{label}</SectionLabel>}
      <h2
        className={cn(
          'mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl',
          dark ? 'text-white' : 'text-text-primary',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mt-4 text-base leading-relaxed', dark ? 'text-white/70' : 'text-text-secondary')}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}
