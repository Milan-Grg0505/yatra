import z from "zod";
import { objectIdSchema } from "./common.validation";

export const createHotelSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\d{10,15}$/).optional(),
  pan_number: z
    .string()
    .regex(/^\d{9}$/, 'PAN must be exactly 9 numeric digits')
    .optional(),
  description: z.string().max(5000).optional(),
  registration_number: z.string().optional(),
  type: z.enum(['resort', 'hostel', 'hotel', 'homestay', 'other']).optional(),
  city_id: objectIdSchema.optional(),
  facitlities: z.array(objectIdSchema).optional(),

  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  address: z.string().max(300).optional(),
  street: z.string().max(200).optional(),
  zip_code: z.string().max(20).optional(),


  check_in_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  check_out_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  cancellation_policy: z.enum(['free', 'flexible', 'moderate', 'strict']).optional(),
  cancellation_deadline_hours: z.coerce.number().int().min(0).optional(),
  cancellation_fee_percentage: z.coerce.number().min(0).max(100).optional(),
  tax_percentage: z.coerce.number().min(0).max(100).optional(),
  service_charge_percentage: z.coerce.number().min(0).max(100).optional(),
  min_advance_booking_days: z.coerce.number().int().min(0).optional(),
  max_advance_booking_days: z.coerce.number().int().min(1).optional(),
  min_stay_nights: z.coerce.number().int().min(1).optional(),

});

// update hotel schema
export const updateHotelSchema = createHotelSchema.partial();

export const hotelSearchSchema = z.object({
  city: z.string().optional(),
  city_id: objectIdSchema.optional(),
  hotelType: z.enum(['resort', 'hostel', 'hotel', 'homestay', 'other']).optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  guests: z.coerce.number().int().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  sort: z.string().optional(),
});

export const hotelStatusSchema = z.object({
  status: z.enum(['approved', 'pending', 'rejected']),
});
