import { useRef, useState, useCallback, type DragEvent } from 'react';
import { LuUpload, LuX, LuImage } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface ImageUploadValue {
  /** Files chosen this session (to send to the API). */
  files: File[];
  /** Already-hosted URLs (existing images on edit). */
  existing: string[];
}

interface ImageUploadProps {
  label?: string;
  multiple?: boolean;
  value: ImageUploadValue;
  onChange: (value: ImageUploadValue) => void;
  hint?: string;
  maxSizeMb?: number;
}

/**
 * Drag-and-drop image picker with live previews.
 * Works for a single logo (multiple=false) or a gallery (multiple=true).
 * Keeps `files` (new uploads) and `existing` (URLs) separate so edit forms
 * can show current images and still upload new ones.
 */
export function ImageUpload({
  label,
  multiple = false,
  value,
  onChange,
  hint,
  maxSizeMb = 5,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const incoming = Array.from(fileList);
      const tooBig = incoming.find((f) => f.size > maxSizeMb * 1024 * 1024);
      if (tooBig) {
        setError(`Each image must be under ${maxSizeMb}MB`);
        return;
      }
      setError(null);
      const next = multiple ? [...value.files, ...incoming] : [incoming[0]!];
      onChange({ ...value, files: next });
    },
    [multiple, onChange, value, maxSizeMb],
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (i: number) =>
    onChange({ ...value, files: value.files.filter((_, idx) => idx !== i) });
  const removeExisting = (i: number) =>
    onChange({ ...value, existing: value.existing.filter((_, idx) => idx !== i) });

  const previews = [
    ...value.existing.map((url, i) => ({ key: `e-${i}`, src: url, onRemove: () => removeExisting(i) })),
    ...value.files.map((f, i) => ({ key: `f-${i}`, src: URL.createObjectURL(f), onRemove: () => removeFile(i) })),
  ];

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1.5 text-text dark:text-dark-text">{label}</label>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition',
          dragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-border dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-600',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
        <LuUpload className="mx-auto h-8 w-8 text-text-3" />
        <p className="mt-2 text-sm text-text-2 dark:text-dark-text-2">
          <span className="font-medium text-primary-600">Click to upload</span> or drag & drop
        </p>
        <p className="text-xs text-text-3 mt-0.5">
          {multiple ? 'PNG, JPG up to' : 'Single image, up to'} {maxSizeMb}MB
        </p>
      </div>

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-text-3">{hint}</p>}

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previews.map((p) => (
            <div key={p.key} className="relative aspect-square rounded-lg overflow-hidden border border-border dark:border-dark-border group">
              <img src={p.src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  p.onRemove();
                }}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove image"
              >
                <LuX className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-text-3">
          <LuImage className="h-3.5 w-3.5" /> No images selected
        </div>
      )}
    </div>
  );
}
