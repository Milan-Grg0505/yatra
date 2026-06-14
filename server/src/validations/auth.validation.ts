import z from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z
    .string()
    .regex(/^\d{10,15}$/, 'Phone must be 10–15 digits')
    .optional(),
  address: z.string().max(200).optional(),
  role: z.enum(['user', 'owner']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const sendOtpSchema = z.object({
  email: z.string().email(),
  type: z.enum(['verification', 'password_reset', 'email_change']),
  new_email: z.string().email().optional(),
});


export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  type: z.enum(['verification', 'password_reset', 'email_change']),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
  new_password: z.string().min(8).max(128),
});


export const changePasswordSchema = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(8).max(128),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});


export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
