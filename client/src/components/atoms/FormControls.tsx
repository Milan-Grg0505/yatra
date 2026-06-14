import { forwardRef, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LuChevronDown } from 'react-icons/lu';

/* ---------- Textarea ---------- */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, rows = 4, ...props }, ref) => {
    const inputId = id ?? `txt-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1.5 text-text dark:text-dark-text">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full rounded-lg border bg-surface dark:bg-dark-surface-2 px-3.5 py-2.5 text-sm text-text dark:text-dark-text placeholder:text-text-3 dark:placeholder:text-dark-text-3 transition resize-y',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
            error ? 'border-danger' : 'border-border dark:border-dark-border',
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-text-3 dark:text-dark-text-3">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

/* ---------- Select (native, simple) ---------- */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id ?? `sel-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1.5 text-text dark:text-dark-text">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-11 rounded-lg border bg-surface dark:bg-dark-surface-2 px-3.5 pr-10 text-sm text-text dark:text-dark-text appearance-none cursor-pointer transition',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
              error ? 'border-danger' : 'border-border dark:border-dark-border',
              className,
            )}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-3" />
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

/* ---------- Checkbox ---------- */
interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  label?: string;
  id?: string;
}
export function Checkbox({ checked, onCheckedChange, label, id }: CheckboxProps) {
  const inputId = id ?? `chk-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <label htmlFor={inputId} className="flex items-center gap-2 cursor-pointer select-none">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-border-strong dark:border-dark-border-strong text-primary-600 focus:ring-primary-500 cursor-pointer"
      />
      {label && <span className="text-sm text-text dark:text-dark-text">{label}</span>}
    </label>
  );
}

/* ---------- Switch (toggle) ---------- */
interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  label?: string;
}
export function Switch({ checked = false, onCheckedChange, label }: SwitchProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-primary-600' : 'bg-border-strong dark:bg-dark-border-strong',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
