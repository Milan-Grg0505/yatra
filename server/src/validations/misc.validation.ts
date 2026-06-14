import { z } from 'zod';
import { objectIdSchema } from './common.validation';

/* ---------- City ---------- */
export const cityCreateSchema = z.object({
  name: z.string().min(1).max(100),
  country: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});
export const cityUpdateSchema = cityCreateSchema.partial();

/* ---------- Blog ---------- */
export const blogCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  content: z.string().optional(),
  tags: z
    .preprocess((val) => {

      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // fallback to comma-separated
        }
        const splitTags = val.split(',').map((s) => s.trim()).filter(Boolean);
        return splitTags;
      }
      if (Array.isArray(val)) return val;
      return undefined;
    }, z.array(z.string()))
    .optional(),
  published: z.coerce.boolean().optional(),
});
export const blogUpdateSchema = blogCreateSchema.partial();

/* ---------- Hero ---------- */
export const heroCreateSchema = z.object({
  title: z.string().min(1).max(200),
  subTitle: z.string().min(1).max(300),
  description: z.string().min(1).max(2000),
  link: z.string().url().optional(),
  order: z.coerce.number().int().optional(),
  active: z.coerce.boolean().optional(),
});
export const heroUpdateSchema = heroCreateSchema.partial();

/* ---------- Facility / Service ---------- */
export const namedItemSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

/* ---------- Policy ---------- */
export const policyCreateSchema = z.object({
  hotel_id: objectIdSchema.optional(),
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});
export const policyUpdateSchema = policyCreateSchema.partial();
