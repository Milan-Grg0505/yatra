import { useState, type ReactNode } from 'react';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import { DataTable, type Column } from '@/components/molecules/DataTable';
import { DeleteConfirmModal } from '@/components/molecules/DeleteConfirmModal';

export interface ResourceManagerProps<T extends Record<string, any>> {
  /** Page heading. */
  title: string;
  subtitle?: string;
  /** Singular entity label used in buttons & confirm dialogs (e.g. "hotel"). */
  entityName: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchKey?: keyof T;
  /** Extract a stable id from a row. */
  getId: (row: T) => string;
  /** Human label for the delete confirmation. */
  getLabel?: (row: T) => string;
  /**
   * Renders the add/edit form inside the modal.
   * `editing` is null when adding. Call `onDone` after a successful save to
   * close the modal and let the caller refresh.
   */
  renderForm: (args: { editing: T | null; onDone: () => void }) => ReactNode;
  /** Delete handler — performs the API call. */
  onDelete?: (row: T) => Promise<void> | void;
  /** Called after add/edit/delete so the caller can re-fetch. */
  onRefresh?: () => void;
  modalSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Hide the Add button (e.g. read-only resources). */
  canAdd?: boolean;
  /** Extra actions renderer per row (optional). */
  extraActions?: (row: T) => ReactNode;
  toolbar?: ReactNode;
}

/**
 * Drop-in CRUD page used across admin & owner dashboards.
 * Renders: title + (toolbar) + Add button (top-right) → DataTable with
 * Edit/Delete actions auto-appended → add/edit Modal → delete confirm Modal.
 *
 * Forms own their submit logic (API + toast); they just call `onDone()`.
 */
export function ResourceManager<T extends Record<string, any>>({
  title,
  subtitle,
  entityName,
  data,
  columns,
  loading,
  searchKey,
  getId,
  getLabel,
  renderForm,
  onDelete,
  onRefresh,
  modalSize = 'lg',
  canAdd = true,
  toolbar,
  extraActions,
}: ResourceManagerProps<T>) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (row: T) => {
    setEditing(row);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    onRefresh?.();
  };

  const actionColumn: Column<T> = {
    key: '__actions',
    header: 'Actions',
    className: 'w-px whitespace-nowrap',
    render: (row) => (
      <div className="flex gap-1">
        <Button size="icon-sm" variant="ghost" onClick={() => openEdit(row)} aria-label="Edit">
          <LuPencil className="h-4 w-4" />
        </Button>
        {onDelete && (
          <Button size="icon-sm" variant="ghost" onClick={() => setDeleting(row)} aria-label="Delete">
            <LuTrash2 className="h-4 w-4 text-danger" />
          </Button>
        )}
        {extraActions && extraActions(row)}
      </div>
    ),
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-text-2 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          {canAdd && (
            <Button onClick={openAdd}>
              <LuPlus className="h-4 w-4" /> Add {entityName}
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={data}
        columns={[...columns, actionColumn]}
        searchKey={searchKey}
        loading={loading}
        emptyMessage={`No ${entityName}s yet`}
      />

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${entityName}` : `Add ${entityName}`}
        size={modalSize}
      >
        {renderForm({ editing, onDone: closeForm })}
      </Modal>

      {/* Delete confirm */}
      <DeleteConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        itemType={entityName}
        itemName={deleting && getLabel ? getLabel(deleting) : undefined}
        onConfirm={async () => {
          if (deleting && onDelete) await onDelete(deleting);
          setDeleting(null);
          onRefresh?.();
        }}
      />
    </div>
  );
}
