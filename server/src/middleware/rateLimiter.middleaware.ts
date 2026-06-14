import rateLimit, { ipKeyGenerator, Options } from 'express-rate-limit';
import { env } from '../config/env';

const base: Partial<Options> = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
};

export const apiLimiter = rateLimit({
  ...base,
  windowMs: env.API_RATE_WINDOW_MINUTES * 60 * 1000,
  limit: env.API_RATE_LIMIT,
});

// Stricter — protects login from brute-force.
export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
});

// OTP requests: configurable per-hour cap (default 3/hour).
export const otpLimiter = rateLimit({
  ...base,
  windowMs: env.OTP_RATE_WINDOW_HOURS * 60 * 60 * 1000,
  limit: env.OTP_RATE_LIMIT,
  keyGenerator: (req) => (req.body?.email as string | undefined)?.toLowerCase() ?? ipKeyGenerator(req.ip ?? 'anon'),
  //                                                  
  message: { success: false, message: 'OTP request limit reached. Please try again later.' },
});
// AI chat: protects expensive AI calls.
export const aiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 20,
  message: { success: false, message: 'AI request limit reached. Slow down.' },
});
