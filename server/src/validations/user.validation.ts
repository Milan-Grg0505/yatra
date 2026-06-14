import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\d{10,15}$/).optional(),
  address: z.string().max(200).optional(),
  role: z.enum(['admin', 'user', 'owner']).optional(),
});

export const updatePreferencesScehma = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  notifications: z.boolean().optional(),
  travel_style: z
    .array(z.enum(['luxury', 'budget', 'adventure', 'family', 'business', 'solo']))
    .optional(),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email({ message: "Invalid email address" }),
});

export const verifyEmailChangeSchema = z.object({
  new_email: z.string().email({ message: "Invalid email address" }),
  otp: z.string().regex(/^\d{6}$/, { message: "OTP must be 6 digits" }),
});