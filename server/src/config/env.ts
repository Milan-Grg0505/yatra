import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  MONGO_URL: z.string().min(1, 'MONGO_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  JWT_EXPIRY: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),

  // Email
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_FROM_NAME: z.string().default('Yatra'),

  // Google OAuth
  // GOOGLE_CLIENT_ID: z.string().optional(),
  // GOOGLE_CLIENT_SECRET: z.string().optional(),
  // GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default('yatra'),

  // AI
  // OPENAI_API_KEY: z.string().optional(),
  // OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  // GEMINI_API_KEY: z.string().optional(),
  // AI_TEMPERATURE: z.coerce.number().default(0.7),
  // AI_MAX_TOKENS: z.coerce.number().default(1000),

  // Maps
  // MAPBOX_ACCESS_TOKEN: z.string().optional(),
  // GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Payments
  // ESEWA_MERCHANT_CODE: z.string().default('EPAYTEST'),
  // ESEWA_SECRET_KEY: z.string().default('8gBm/:&EnhH.1/q'),
  // ESEWA_BASE_URL: z.string().default('https://rc-epay.esewa.com.np'),
  // KHALTI_SECRET_KEY: z.string().optional(),
  // KHALTI_PUBLIC_KEY: z.string().optional(),
  // KHALTI_BASE_URL: z.string().default('https://a.khalti.com/api/v2'),

  // URLs
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  SERVER_URL: z.string().url().default('http://localhost:5000'),

  // Rate limiting
  OTP_RATE_LIMIT: z.coerce.number().default(3),
  OTP_RATE_WINDOW_HOURS: z.coerce.number().default(1),
  API_RATE_LIMIT: z.coerce.number().default(100),
  API_RATE_WINDOW_MINUTES: z.coerce.number().default(15),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(10),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Feature flags
  ENABLE_AI: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  ENABLE_MAPS: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  ENABLE_TRAVEL_MODULE: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  ENABLE_OTP_VERIFICATION: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
