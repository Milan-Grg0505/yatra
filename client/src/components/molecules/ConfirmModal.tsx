import { useState, type ReactNode } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
  icon?: ReactNode;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  icon = <LuTriangleAlert className="h-7 w-7" />,
}: ConfirmModalProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const iconBgClass = confirmVariant === 'danger' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary';

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={`mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full ${iconBgClass}`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-text dark:text-dark-text">{title}</h3>
        <p className="mt-2 text-sm text-text-2 dark:text-dark-text-2">{message}</p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" fullWidth onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant={confirmVariant} fullWidth onClick={handleConfirm} loading={busy}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
