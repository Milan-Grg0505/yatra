import { useState, useMemo, type ReactNode } from 'react';
import { LuArrowUpDown, LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu';
import { Input, Skeleton } from '@/components/atoms';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  pageSize = 10,
  loading,
  emptyMessage = 'No data',
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const filtered = useMemo(() => {
    if (!search || !searchKey) return data;
    return data.filter((row) => String(row[searchKey] ?? '').toLowerCase().includes(search.toLowerCase()));
  }, [data, search, searchKey]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  return (
    <div className="rounded-2xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface overflow-hidden">
      {searchKey && (
        <div className="p-4 border-b border-border dark:border-dark-border">
          <Input
            icon={<LuSearch className="h-4 w-4" />}
            placeholder="Search…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 dark:bg-dark-surface-2 text-text-2 dark:text-dark-text-2 text-left">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn('px-4 py-3 font-medium text-xs uppercase tracking-wide', col.className)}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => {
                        const dir = sort?.key === col.key && sort.dir === 'asc' ? 'desc' : 'asc';
                        setSort({ key: String(col.key), dir });
                      }}
                      className="inline-flex items-center gap-1 hover:text-text dark:hover:text-dark-text"
                    >
                      {col.header}
                      <LuArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border dark:border-dark-border">
                  {columns.map((c) => (
                    <td key={String(c.key)} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-text-3">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-border dark:border-dark-border hover:bg-surface-2 dark:hover:bg-dark-surface-2 transition"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className={cn('px-4 py-3 text-text dark:text-dark-text', col.className)}>
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border dark:border-dark-border bg-surface-2 dark:bg-dark-surface-2">
          <span className="text-xs text-text-2">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded hover:bg-surface-3 disabled:opacity-30"
            >
              <LuChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded hover:bg-surface-3 disabled:opacity-30"
            >
              <LuChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
