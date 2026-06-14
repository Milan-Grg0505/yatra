import { type ReactNode } from 'react';
import { LuLoader, LuStar, LuMountain } from 'react-icons/lu';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, getInitials } from '@/lib/utils';

/* ---------- Badge ---------- */
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border',
  {
    variants: {
      variant: {
        default: 'bg-surface-3 dark:bg-dark-surface-3 text-text-2 dark:text-dark-text-2 border-border',
        primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
        success: 'bg-success/10 text-success border-success/30',
        warning: 'bg-warning/10 text-warning border-warning/30',
        danger: 'bg-danger/10 text-danger border-danger/30',
        accent: 'bg-accent-500/10 text-accent-600 border-accent-500/30',
        outline: 'bg-transparent text-text dark:text-dark-text border-border-strong',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}

/* ---------- Avatar ---------- */
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-lg' };

export function Avatar({ src, name = '?', size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 overflow-hidden shrink-0 border border-border dark:border-dark-border',
        sizeMap[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

/* ---------- Spinner ---------- */
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size];
  return <LuLoader className={cn('animate-spin text-primary-600', s, className)} />;
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton-shimmer rounded-md', className)} aria-hidden="true" />;
}

/* ---------- Rating ---------- */
interface RatingProps {
  value: number;
  max?: number;
  size?: number;
  readonly?: boolean;
  className?: string;
  onChange?: (v: number) => void;
}
export function Rating({ value, max = 5, size = 16, readonly = true, className, onChange }: RatingProps) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i + 1 <= value;
        const Star = LuStar;
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(i + 1)}
            className={cn(!readonly && 'hover:scale-110 transition cursor-pointer', readonly && 'cursor-default')}
            aria-label={`${i + 1} stars`}
          >
            <Star
              size={size}
              className={cn(filled ? 'fill-accent-500 text-accent-500' : 'text-border-strong dark:text-dark-border-strong')}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Logo ---------- */
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}
const logoSize = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-12 w-12' };
const logoTextSize = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' };

export function Logo({ size = 'md', withText = true, className }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md',
          logoSize[size],
        )}
      >
        <LuMountain className="h-1/2 w-1/2" />
      </div>
      {withText && (
        <span className={cn('font-display font-bold tracking-tight text-text dark:text-dark-text', logoTextSize[size])}>
          Yatra
        </span>
      )}
    </div>
  );
}
