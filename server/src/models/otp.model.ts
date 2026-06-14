import { Document, model, Types } from "mongoose";
import { OtpType } from "../types";
import { Schema } from "mongoose";


export interface IOtpDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  otp: string; // hashed
  type: OtpType;
  expires_at: Date;
  attempts: number;
  verified: boolean;
  payload?: Record<string, unknown>; // e.g. for email change: { new_email }
  createdAt: Date;
}

const otpSchema = new Schema<IOtpDocument>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    type: {
      type: String,
      enum: ['verification', 'password_reset', 'email_change'],
      required: true,
    },
    expires_at: { type: Date, required: true },
    attempts: { type: Number, default: 0, max: 5 },
    verified: { type: Boolean, default: false },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);


otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, type: 1 });

export const Otp = model<IOtpDocument>('Otp', otpSchema);