import * as Popover from '@radix-ui/react-popover';
import { LuChevronDown, LuCheck, LuX } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
}

/** Reusable multi-select (Radix Popover + checkbox list), shows chips when filled. */
export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  error,
}: MultiSelectProps) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  const selected = options.filter((o) => value.includes(o.value));

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1.5 text-text dark:text-dark-text">{label}</label>}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              'w-full min-h-11 rounded-lg border bg-surface dark:bg-dark-surface-2 px-3 py-2 text-left text-sm flex items-center justify-between gap-2 transition',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
              error ? 'border-danger' : 'border-border dark:border-dark-border',
            )}
          >
            <span className="flex flex-wrap gap-1 flex-1">
              {selected.length === 0 ? (
                <span className="text-text-3">{placeholder}</span>
              ) : (
                selected.map((o) => (
                  <span
                    key={o.value}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 text-xs"
                  >
                    {o.label}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(o.value);
                      }}
                      className="hover:text-danger cursor-pointer"
                    >
                      <LuX className="h-3 w-3" />
                    </span>
                  </span>
                ))
              )}
            </span>
            <LuChevronDown className="h-4 w-4 text-text-3 shrink-0" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={4}
            align="start"
            className="z-50 w-[var(--radix-popover-trigger-width)] max-h-64 overflow-y-auto rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface shadow-elevated p-1 animate-fade-in"
          >
            {options.length === 0 ? (
              <p className="p-3 text-center text-xs text-text-3">No options</p>
            ) : (
              options.map((o) => {
                const checked = value.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-2 dark:hover:bg-dark-surface-2 transition text-left"
                  >
                    <span
                      className={cn(
                        'h-4 w-4 rounded border flex items-center justify-center shrink-0',
                        checked ? 'bg-primary-600 border-primary-600 text-white' : 'border-border-strong dark:border-dark-border-strong',
                      )}
                    >
                      {checked && <LuCheck className="h-3 w-3" />}
                    </span>
                    {o.label}
                  </button>
                );
              })
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
