import { useState } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemName?: string;
  itemType?: string;
}

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
}: DeleteConfirmModalProps) {
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

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <LuTriangleAlert className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-text dark:text-dark-text">Delete {itemType}?</h3>
        <p className="mt-2 text-sm text-text-2 dark:text-dark-text-2">
          {itemName ? (
            <>
              You're about to delete <span className="font-medium text-text dark:text-dark-text">"{itemName}"</span>. This action cannot be undone.
            </>
          ) : (
            <>This action cannot be undone.</>
          )}
        </p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" fullWidth onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={handleConfirm} loading={busy}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
