import crypto from 'crypto';

export function generateOtp(length = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(crypto.randomInt(min, max + 1));
}

export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}


export interface PaginationOpts {
  page?: number | string;
  limit?: number | string;
  maxLimit?: number;
}

export function parsePagination(opts: PaginationOpts) {
  const page = Math.max(1, parseInt(String(opts.page ?? 1), 10) || 1);
  const limit = Math.min(opts.maxLimit ?? 100, Math.max(1, parseInt(String(opts.limit ?? 20), 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
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