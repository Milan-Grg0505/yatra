import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ---------- Tabs ---------- */
interface TabsProps {
  value: string;
  onChange: (v: string) => void;
  items: Array<{ value: string; label: ReactNode; content?: ReactNode }>;
  className?: string;
}

export function Tabs({ value, onChange, items, className }: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onChange} className={className}>
      <TabsPrimitive.List className="inline-flex gap-1 rounded-xl border border-border dark:border-dark-border bg-surface-2 dark:bg-dark-surface-2 p-1">
        {items.map((it) => (
          <TabsPrimitive.Trigger
            key={it.value}
            value={it.value}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-lg transition',
              'data-[state=active]:bg-surface dark:data-[state=active]:bg-dark-surface',
              'data-[state=active]:text-text dark:data-[state=active]:text-dark-text',
              'data-[state=active]:shadow-sm',
              'text-text-2 dark:text-dark-text-2 hover:text-text dark:hover:text-dark-text',
            )}
          >
            {it.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map(
        (it) =>
          it.content && (
            <TabsPrimitive.Content key={it.value} value={it.value} className="mt-6 outline-none">
              {it.content}
            </TabsPrimitive.Content>
          ),
      )}
    </TabsPrimitive.Root>
  );
}

/* ---------- Tooltip ---------- */
export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={4}
            className="z-50 rounded-md bg-text dark:bg-dark-surface-3 px-2.5 py-1.5 text-xs text-white shadow-md animate-fade-in"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-text dark:fill-dark-surface-3" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
