'use client';

import { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <label
        htmlFor={inputId}
        className={cn('group inline-flex cursor-pointer items-center gap-2', className)}
      >
        <span className="relative inline-flex h-4 w-4 items-center justify-center">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-border bg-white transition-colors checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            {...props}
          />
          <Check
            size={12}
            strokeWidth={3}
            className="pointer-events-none absolute hidden text-white peer-checked:block"
          />
        </span>
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
