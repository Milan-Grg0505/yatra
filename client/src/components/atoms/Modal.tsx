import * as Dialog from '@radix-ui/react-dialog';
import { LuX } from 'react-icons/lu';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  footer?: ReactNode;
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
};

export function Modal({ open, onClose, title, description, children, size = 'md', footer }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-h-[90vh] overflow-hidden',
            'bg-surface dark:bg-dark-surface rounded-2xl shadow-2xl border border-border dark:border-dark-border',
            'flex flex-col',
            sizeMap[size],
          )}
        >
          {(title || description) && (
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border dark:border-dark-border">
              <div className="min-w-0">
                {title && <Dialog.Title className="text-lg font-semibold text-text dark:text-dark-text">{title}</Dialog.Title>}
                {description && <Dialog.Description className="text-sm text-text-2 dark:text-dark-text-2 mt-1">{description}</Dialog.Description>}
              </div>
              <Dialog.Close asChild>
                <button
                  className="shrink-0 rounded-lg p-1.5 hover:bg-surface-2 dark:hover:bg-dark-surface-2 transition"
                  aria-label="Close"
                >
                  <LuX className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          )}
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border dark:border-dark-border bg-surface-2 dark:bg-dark-surface-2">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
