import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils.ts';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightSlot?: ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightSlot, hint, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text dark:text-dark-text mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 dark:text-dark-text-3 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-11 rounded-lg border bg-surface dark:bg-dark-surface-2 px-3.5 text-sm text-text dark:text-dark-text placeholder:text-text-3 dark:placeholder:text-dark-text-3 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-danger focus:border-danger focus:ring-danger/30'
                : 'border-border dark:border-dark-border',
              icon && 'pl-10',
              rightSlot && 'pr-10',
              className,
            )}
            {...props}
          />
          {rightSlot && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 dark:text-dark-text-3">
              {rightSlot}
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-text-3 dark:text-dark-text-3">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
