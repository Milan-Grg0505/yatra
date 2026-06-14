import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';

/**
 * Tailwind-aware className merger.
 *   cn('px-2 py-1', condition && 'bg-red-500', { 'rounded-md': true })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------- Number / Currency ---------- */
export function formatCurrency(amount: number, currency = 'NPR'): string {
  if (currency === 'NPR') return `रू ${amount.toLocaleString('en-IN')}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* ---------- Dates ---------- */
export function formatDate(date: string | Date, fmt = 'PP'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, fmt);
  } catch {
    return '';
  }
}

export function timeAgo(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
}

export function nightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const a = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const b = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  return Math.max(0, differenceInDays(b, a));
}

/* ---------- Strings ---------- */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/* ---------- URL params ---------- */
export function buildParams(obj: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null || val === '') continue;
    if (Array.isArray(val)) val.forEach((v) => params.append(key, String(v)));
    else params.set(key, String(val));
  }
  return params;
}

/* ---------- Color helpers for review sentiment / status badges ---------- */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    approved: 'bg-success/15 text-success border-success/30',
    confirmed: 'bg-success/15 text-success border-success/30',
    pending: 'bg-warning/15 text-warning border-warning/30',
    canceled: 'bg-danger/15 text-danger border-danger/30',
    cancelled: 'bg-danger/15 text-danger border-danger/30',
    rejected: 'bg-danger/15 text-danger border-danger/30',
    completed: 'bg-primary-500/15 text-primary-600 border-primary-500/30',
    paid: 'bg-success/15 text-success border-success/30',
    refunded: 'bg-text-3/15 text-text-2 border-border-strong',
    failed: 'bg-danger/15 text-danger border-danger/30',
  };
  return map[status] ?? 'bg-surface-3 text-text-2 border-border';
}

export function difficultyColor(level: string): string {
  return {
    easy: 'bg-success/15 text-success border-success/30',
    moderate: 'bg-warning/15 text-warning border-warning/30',
    challenging: 'bg-danger/15 text-danger border-danger/30',
  }[level] ?? 'bg-surface-3';
}

/* ---------- Misc ---------- */
export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function noop() {
  /* */
}
