import { z } from 'zod';

/* ---------- Hotel ---------- */
export const hotelSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^\d{10,15}$/, 'Invalid phone')
    .optional()
    .or(z.literal('')),
  pan_number: z
    .string()
    .regex(/^\d{9}$/, 'PAN must be exactly 9 numeric digits')
    .optional()
    .or(z.literal('')),
  description: z.string().max(5000).optional(),
  type: z.enum(['resort', 'hostel', 'hotel', 'homestay', 'other']),
  city_id: z.string().min(1, 'City required'),
  address: z.string().min(2, 'Address required'),
  street: z.string().optional(),
  zip_code: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  check_in_time: z.string().regex(/^\d{2}:\d{2}$/).default('14:00'),
  check_out_time: z.string().regex(/^\d{2}:\d{2}$/).default('12:00'),
  cancellation_policy: z.enum(['free', 'flexible', 'moderate', 'strict']).default('flexible'),
  tax_percentage: z.coerce.number().min(0).max(100).default(13),
  service_charge_percentage: z.coerce.number().min(0).max(100).default(10),
  facilities: z.array(z.string()).optional(),
});
export type HotelInput = z.infer<typeof hotelSchema>;

/* ---------- Room ---------- */
export const roomSchema = z.object({
  hotel_id: z.string().min(1),
  room_type: z.enum(['single', 'double', 'suite', 'deluxe', 'family', 'other']),
  room_name: z.string().min(1, 'Name required'),
  numberOf_rooms: z.coerce.number().int().min(1),
  bed_type: z.enum(['single', 'double', 'queen', 'king', 'bunk', 'sofa', 'other']),
  numberOf_beds: z.coerce.number().int().min(1),
  smoking_policy: z.enum(['smoking', 'non-smoking', 'both']).default('non-smoking'),
  base_price: z.coerce.number().min(0, 'Required'),
  max_guest: z.coerce.number().int().min(1),
  roomSize: z.string().optional(),
  discount_percentage: z.coerce.number().min(0).max(100).default(0),
  amenities: z.array(z.string()).optional(),
  view_type: z.enum(['city', 'mountain', 'garden', 'pool', 'ocean', 'none']).default('none'),
  has_ac: z.boolean().default(false),
  has_wifi: z.boolean().default(true),
  has_tv: z.boolean().default(false),
  has_minibar: z.boolean().default(false),
  has_safe: z.boolean().default(false),
});
export type RoomInput = z.infer<typeof roomSchema>;

/* ---------- Booking ---------- */
export const bookingSchema = z
  .object({
    hotel_id: z.string().min(1),
    room: z.string().optional(),
    check_in: z.string().min(1, 'Required'),
    check_out: z.string().min(1, 'Required'),
    num: z.coerce.number().int().min(1).default(1),
    guest_count: z.coerce.number().int().min(1).default(1),
    special_requests: z.string().max(500).optional(),
    guest_details: z
      .array(
        z.object({
          full_name: z.string().min(1, 'Name required'),
          age: z.coerce.number().int().min(0).max(150).optional(),
          gender: z.enum(['male', 'female', 'other']).optional(),
        }),
      )
      .optional(),
    coupon_code: z.string().toUpperCase().optional(),
    payment_method: z.enum(['esewa', 'khalti', 'cash']).default('esewa'),
  })
  .refine((d) => new Date(d.check_out) > new Date(d.check_in), {
    message: 'Check-out must be after check-in',
    path: ['check_out'],
  });
export type BookingInput = z.infer<typeof bookingSchema>;

/* ---------- Review ---------- */
export const reviewSchema = z.object({
  hotel_id: z.string().min(1),
  booking_id: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().min(3, 'Min 3 chars').max(100),
  comment: z.string().min(10, 'Min 10 chars').max(1000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

/* ---------- Travel package ---------- */
export const travelPackageSchema = z.object({
  name: z.string().min(3, 'Name required'),
  description: z.string().min(10, 'Description required'),
  duration_days: z.coerce.number().int().min(1),
  duration_nights: z.coerce.number().int().min(0),
  price_per_person: z.coerce.number().min(0),
  discount_price: z.coerce.number().min(0).optional(),
  difficulty_level: z.enum(['easy', 'moderate', 'challenging']).default('easy'),
  group_size_min: z.coerce.number().int().min(1).default(1),
  group_size_max: z.coerce.number().int().min(1).default(20),
  start_city_id: z.string().min(1),
  end_city_id: z.string().min(1),
  city_ids: z.array(z.string()).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'upcoming']).default('active'),
});

/* ---------- Travel booking ---------- */
export const travelBookingSchema = z.object({
  package_id: z.string().min(1),
  travel_date: z.string().min(1, 'Required'),
  number_of_travelers: z.coerce.number().int().min(1),
  traveler_details: z
    .array(
      z.object({
        full_name: z.string().min(1, 'Name required'),
        age: z.coerce.number().int().min(0).optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        nationality: z.string().optional(),
        id_proof: z.string().optional(),
      }),
    )
    .min(1, 'At least one traveler required'),
  special_requirements: z.string().max(1000).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  payment_method: z.enum(['esewa', 'khalti', 'cash']).default('esewa'),
});

/* ---------- Profile ---------- */
export const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\d{10,15}$/).optional().or(z.literal('')),
  address: z.string().max(200).optional(),
});

export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  notifications: z.boolean().optional(),
  travel_style: z.array(z.enum(['luxury', 'budget', 'adventure', 'family', 'business', 'solo'])).optional(),
});

/* ---------- City / Blog / Hero / Coupon ---------- */
export const citySchema = z.object({
  name: z.string().min(1, 'Required'),
  country: z.string().default('Nepal'),
  description: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export const blogSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().default(true),
});

export const heroSchema = z.object({
  title: z.string().min(1),
  subTitle: z.string().min(1),
  description: z.string().min(1),
  link: z.string().url().optional().or(z.literal('')),
  order: z.coerce.number().default(0),
  active: z.boolean().default(true),
  image: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().min(0),
  min_booking_amount: z.coerce.number().min(0).default(0),
  max_discount_amount: z.coerce.number().min(0).optional(),
  valid_from: z.string().min(1),
  valid_until: z.string().min(1),
  usage_limit: z.coerce.number().int().min(0).optional(),
  active: z.boolean().default(true),
});
