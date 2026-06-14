import { z } from 'zod';
import { objectIdSchema } from './common.validation';

export const createRoomSchema = z.object({
  hotel_id: objectIdSchema,
  room_type: z.enum(['single', 'double', 'suite', 'deluxe', 'family', 'other']).optional(),
  room_name: z.string().min(1).max(100),
  numberOf_rooms: z.coerce.number().int().min(1),
  bed_type: z.enum(['single', 'double', 'queen', 'king', 'bunk', 'sofa', 'other']).optional(),
  numberOf_beds: z.coerce.number().int().min(1),
  smoking_policy: z.enum(['smoking', 'non-smoking', 'both']).optional(),
  base_price: z.coerce.number().min(0),
  max_guest: z.coerce.number().int().min(1),
  roomSize: z.string().max(50).optional(),
  services: z.array(objectIdSchema).optional(),
  discount_percentage: z.coerce.number().min(0).max(100).optional(),
  weekend_price: z.coerce.number().min(0).optional(),
  festival_price: z.coerce.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  view_type: z.enum(['city', 'mountain', 'garden', 'pool', 'ocean', 'none']).optional(),
  floor_number: z.coerce.number().int().min(0).optional(),
  has_ac: z.coerce.boolean().optional(),
  has_wifi: z.coerce.boolean().optional(),
  has_tv: z.coerce.boolean().optional(),
  has_minibar: z.coerce.boolean().optional(),
  has_safe: z.coerce.boolean().optional(),
});

export const updateRoomSchema = createRoomSchema.partial();
