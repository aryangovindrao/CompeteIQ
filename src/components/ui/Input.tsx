'use client';

import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, id, type = 'text', ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const realType = isPassword ? (show ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            type={realType}
            className={cn(
              'h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-text-primary placeholder:text-text-muted',
              'transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25',
              'disabled:cursor-not-allowed disabled:bg-surface-2',
              leftIcon && 'pl-9',
              isPassword && 'pr-10',
              error && 'border-danger focus:border-danger focus:ring-danger/25',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              tabIndex={-1}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
