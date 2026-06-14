import { type ReactNode } from 'react';
import { LuPackageX } from 'react-icons/lu';
import { Button } from '@/components/atoms';
import { cn, formatCurrency } from '@/lib/utils';

/* ---------- PriceSummary ---------- */
interface PriceSummaryProps {
  base: number;
  tax: number;
  serviceCharge: number;
  discount?: number;
  nights?: number;
  className?: string;
}
export function PriceSummary({ base, tax, serviceCharge, discount = 0, nights, className }: PriceSummaryProps) {
  const total = base + tax + serviceCharge - discount;
  return (
    <div className={cn('p-4 rounded-xl bg-surface-2 dark:bg-dark-surface-2 border border-border dark:border-dark-border space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-text-2">Base price {nights ? `(${nights} ${nights === 1 ? 'night' : 'nights'})` : ''}</span>
        <span className="font-medium">{formatCurrency(base)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-text-2">Tax</span>
        <span className="font-medium">{formatCurrency(tax)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-text-2">Service charge</span>
        <span className="font-medium">{formatCurrency(serviceCharge)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm text-success">
          <span>Discount</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}
      <div className="border-t border-border dark:border-dark-border pt-2 flex justify-between font-bold">
        <span>Total</span>
        <span className="text-primary-600 text-lg">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

/* ---------- NoResults / Empty State ---------- */
interface NoResultsProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
}
export function NoResults({ title = 'No results', message, icon, action }: NoResultsProps) {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-surface-2 dark:bg-dark-surface-2 text-text-3 mb-4">
        {icon ?? <LuPackageX className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-semibold text-text dark:text-dark-text">{title}</h3>
      {message && <p className="text-sm text-text-2 dark:text-dark-text-2 mt-1">{message}</p>}
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
