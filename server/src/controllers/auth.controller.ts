import { Request, Response } from 'express';
import { env } from "../config/env";
import { ActivityLog } from "../models/activityLog.model";
import { User } from "../models/user.model";
import { otpService } from "../services/otp.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { LoginInput, RegisterInput } from "../validations/auth.validation";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';

const cookieOpts = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function userPayload(user: { _id: any; email: string; role: any; hotel?: any; name: string }) {
  return {
    sub: String(user._id),
    email: user.email,
    role: user.role,
    hotel: user.hotel ? String(user.hotel) : null,
    name: user.name,
  }
}

export const authController = {
  register: asyncHandler(async (req, res) => {
    const body = req.body as RegisterInput;
    const file = (req as Request & { file?: Express.Multer.File }).file;

    const existing = await User.findOne({ email: body.email.toLowerCase(), deleted_at: null });
    if (existing) throw ApiError.conflict('Email already registered');

    const user = await User.create({
      ...body,
      email: body.email.toLowerCase(),
      role: body.role ?? 'user',
      image: file?.path,
    });

    if (env.ENABLE_OTP_VERIFICATION) {
      await otpService.send(user.email, 'verification');
    }

    await ActivityLog.create({
      user_id: user._id,
      action: 'User registered',
      action_type: 'register',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    return ApiResponse.created(res, { user, otpRequired: env.ENABLE_OTP_VERIFICATION }, 'Registered successfully');
  }),

  // login 
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body as LoginInput;
    const user = await User.findByEmail(email);
    if (!user) throw ApiError.unauthorized("Invalid credentials");
    if (!(await user.comparePassword(password))) throw ApiError.unauthorized("Invalid credentials")

    user.last_login = new Date();
    await user.save();

    const token = signAccessToken(userPayload(user));
    const refresh_token = signRefreshToken({ sub: String(user._id) });
    res.cookie("token", token, cookieOpts);

    await ActivityLog.create({
      user_id: user._id,
      action: "User login in",
      action_type: "login",
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    return ApiResponse.ok(res, { user: user.toJSON(), token, refresh_token }, "Login successfully");

  }),


  // logout
  logout: asyncHandler(async (req, res) => {
    res.clearCookie("token", cookieOpts);

    if (req.user?.id) {
      await ActivityLog.create({
        user_id: req.user?.id,
        action: "User logout",
        action_type: "logout",
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      })
    }
    return ApiResponse.ok(res, {}, "Logout successfully")
  }),

  // verify
  verify: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized("User not found")
    const user = await User.findById(req.user.id).lean();

    return ApiResponse.ok(res, { user });
  }),

  // refresh
  refresh: asyncHandler(async (req, res) => {
    const { refresh_token } = req.body as { refresh_token: string };

    const { sub } = verifyRefreshToken(refresh_token);
    const user = await User.findById(sub);

    if (!user || user.deleted_at) throw ApiError.unauthorized();

    const token = signAccessToken(userPayload(user));
    res.cookie("token", token, cookieOpts);
    return ApiResponse.ok(res, { token }, 'Token refreshed');
  }),


  /* -------- OTP -------- */
  sendOtp: asyncHandler(async (req, res) => {
    const { email, type, new_email } = req.body as {
      email: string;
      type: 'verification' | 'password_reset' | 'email_change';
      new_email?: string;
    };
    if (type === 'email_change' && !new_email) throw ApiError.badRequest('new_email is required');
    await otpService.send(email, type, new_email ? { new_email } : undefined);
    return ApiResponse.ok(res, undefined, 'OTP sent to your email');
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const { email, otp, type } = req.body as {
      email: string;
      otp: string;
      type: 'verification' | 'password_reset' | 'email_change';
    };

    await otpService.verify(email, otp, type);

    if (type === 'verification') {
      await User.findOneAndUpdate({ email: email.toLowerCase() }, { isEmailVerified: true });
    }
    return ApiResponse.ok(res, undefined, 'OTP verified');
  }),


  // reset password
  resetPassword: asyncHandler(async (req, res) => {
    const { email, otp, new_password } = req.body as {
      email: string;
      otp: string;
      new_password: string;
    };
    await otpService.verify(email, otp, 'password_reset');
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw ApiError.notFound('User not found');
    user.password = new_password;
    await user.save();
    await otpService.consume(email, 'password_reset');
    return ApiResponse.ok(res, undefined, 'Password reset successful');
  }),

  // auth.controller.ts - Add this method
  registerFirstAdmin: asyncHandler(async (req, res) => {
    // Safety check
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('No body received! Headers:', req.headers);
      throw ApiError.badRequest('Request body is empty. Please ensure you are sending JSON data with Content-Type: application/json');
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      throw ApiError.forbidden('Admin already exists. Only one admin can be registered.');
    }

    const { name, email, password, phone, address } = req.body;

    // Check if email is already used
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Create the first admin
    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      address,
      role: 'admin',
      isEmailVerified: true, // Auto-verify admin
    });

    // Generate token for immediate login
    const token = signAccessToken(userPayload(admin));
    const refresh_token = signRefreshToken({ sub: String(admin._id) });

    // Log the creation
    await ActivityLog.create({
      user_id: admin._id,
      action: 'First admin registered',
      action_type: 'register',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    return ApiResponse.created(res, {
      user: admin.toJSON(),
      token,
      refresh_token
    }, 'Admin created successfully. Please save your credentials.');
  }),


}