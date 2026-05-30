'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark shadow-sm focus-visible:ring-primary/40',
  secondary:
    'bg-white border border-border text-gray-700 hover:bg-surface-2 focus-visible:ring-primary/30',
  ghost: 'text-primary hover:bg-primary-light focus-visible:ring-primary/30',
  outline:
    'border border-primary text-primary hover:bg-primary-light focus-visible:ring-primary/30',
  dark: 'bg-dark text-white hover:bg-dark-2 focus-visible:ring-white/30',
  danger: 'bg-danger text-white hover:bg-red-600 focus-visible:ring-danger/40',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-md gap-1.5',
  md: 'h-10 px-5 text-sm rounded-md gap-2',
  lg: 'h-11 px-6 text-[15px] rounded-md gap-2',
  icon: 'h-9 w-9 rounded-md',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface ButtonProps
  extends BaseProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {}

const base =
  'inline-flex items-center justify-center font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      fullWidth,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner className="h-4 w-4" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  ),
);
Button.displayName = 'Button';

export interface LinkButtonProps
  extends BaseProps,
    Omit<React.ComponentProps<typeof Link>, 'className'> {
  className?: string;
}

export function LinkButton({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth,
  leftIcon,
  rightIcon,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </Link>
  );
}
