import { Otp } from "../models/otp.model";
import { OtpType } from "../types";
import { generateOtp } from "../utils/helper";
import bcrypt from "bcryptjs";
import { emailService } from "./email.service";
import { ApiError } from "../utils/ApiError";

const OTP_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;


export const otpService = {
  async send(email: string, type: OtpType, payload?: Record<string, unknown>): Promise<void> {
    const otp = generateOtp(6);
    const hashed = await bcrypt.hash(otp, 8);
    const expires_at = new Date(Date.now() + OTP_TTL_MIN * 60_000);

    // Invalidate previous unverified OTPs of the same type
    await Otp.deleteMany({ email: email.toLowerCase(), type, verified: false });

    await Otp.create({
      email: email.toLowerCase(),
      otp: hashed,
      type,
      expires_at,
      payload,
    });

    await emailService.sendOtp(email, otp, type);
  },

  // verify email or password 
  async verify(email: string, otp: string, type: OtpType): Promise<{ payload?: Record<string, unknown> }> {
    const record = await Otp.findOne({
      email: email.toLowerCase(),
      type,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!record) throw ApiError.notFound("No OTP request found. Please request a new code");
    if (record.expires_at.getTime() < Date.now()) throw ApiError.badRequest("OTP has expired.Please request a new code");

    if (record.attempts >= MAX_ATTEMPTS) {
      await record.deleteOne()
      throw ApiError.badRequest("Too many failed attempts. Please request a new code")
    }

    const ok = await bcrypt.compare(otp, record.otp);
    if (!ok) {
      record.attempts += 1;
      await record.save();
      throw ApiError.badRequest(`Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts left.`);
    }
    record.verified = true;
    await record.save();
    return { payload: record.payload };
  },

  async consume(email: string, type: OtpType): Promise<void> {
    await Otp.deleteMany({
      email: email.toLowerCase(),
      type,
    })
  }
}


