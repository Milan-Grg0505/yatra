import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { uploadUser } from '../middleware/upload.middleware';

import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  refreshSchema,
} from '../validations/auth.validation';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.middleaware';

const router = Router();

router.post('/register', uploadUser.single('image'), validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/verify', authenticate, authController.verify);
router.post('/refresh', validate(refreshSchema), authController.refresh);

// OTP
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/verify-email', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Google OAuth
// router.get('/google', authController.googleStart);
// router.get('/google/callback', authController.googleCallback);
// router.post('/google/unlink', authenticate, authController.unlinkGoogle);

// register first admin
router.post('/register-first-admin', authController.registerFirstAdmin);
export default router;
