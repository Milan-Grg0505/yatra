import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { LuLoader } from 'react-icons/lu';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
        secondary:
          'bg-surface-2 dark:bg-dark-surface-2 text-text dark:text-dark-text hover:bg-surface-3 dark:hover:bg-dark-surface-3 border border-border dark:border-dark-border',
        outline:
          'border border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
        ghost:
          'text-text dark:text-dark-text hover:bg-surface-2 dark:hover:bg-dark-surface-2',
        danger:
          'bg-danger text-white hover:bg-red-600 shadow-sm',
        link: 'text-primary-600 dark:text-primary-400 underline-offset-4 hover:underline p-0 h-auto',
        accent: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm',
        surface: 'bg-surface-2 dark:bg-dark-surface-2 text-text dark:text-dark-text hover:bg-surface-3 dark:hover:bg-dark-surface-3',
        success: 'bg-success text-white hover:bg-success/80 shadow-sm',
        warning: 'bg-warning text-white hover:bg-warning/80 shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-base',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, asChild, children, disabled, onClick, ...props }, ref) => {
    const Comp = (asChild ? Slot : 'button') as any;
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading && <LuLoader className="h-4 w-4 animate-spin" />}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  },
);
Button.displayName = 'Button';
