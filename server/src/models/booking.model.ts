import { Document, model, Schema, Types } from "mongoose";
import { IHotel } from "./hotel.model";
import { IRoom } from "./room.model";
import { BookingStatus, PaymentMethod, PaymentStatus } from "../types";

export interface IGuestDetail {
  full_name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

export interface IBooking {
  user_id: Types.ObjectId;
  hotel_id: Types.ObjectId;
  room?: Types.ObjectId | null;
  check_in: Date;
  check_out: Date;
  num: number;
  guest_count: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_id?: string;

  base_price: number;
  tax_amount: number;
  service_charge: number;
  discount_amount: number;
  total_price: number;

  coupon_code?: string;
  special_requests?: string;
  guest_details: IGuestDetail[];

  cancelled_at?: Date;
  cancellation_reason?: string;
  cancellation_predicted_score?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingDocument extends IBooking, Document {
  _id: Types.ObjectId;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', default: null },
    check_in: { type: Date, required: true, index: true },
    check_out: { type: Date, required: true, index: true },
    num: { type: Number, required: true, min: 1 },
    guest_count: { type: Number, required: true, min: 1 },

    status: {
      type: String,
      enum: ['confirmed', 'pending', 'canceled', 'completed'],
      default: 'pending',
      index: true,
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
      index: true,
    },
    payment_method: { type: String, enum: ['esewa', 'khalti', 'cash'] },
    payment_id: { type: String, trim: true },

    base_price: { type: Number, required: true, min: 0 },
    tax_amount: { type: Number, required: true, min: 0 },
    service_charge: { type: Number, required: true, min: 0 },
    discount_amount: { type: Number, default: 0, min: 0 },
    total_price: { type: Number, required: true, min: 0 },

    coupon_code: { type: String, uppercase: true, trim: true },
    special_requests: { type: String, maxlength: 500 },
    guest_details: [
      {
        full_name: { type: String, required: true, trim: true },
        age: { type: Number, min: 0 },
        gender: { type: String, enum: ['male', 'female', 'other'] },
      },
    ],

    cancelled_at: { type: Date },
    cancellation_reason: { type: String, trim: true },
    cancellation_predicted_score: { type: Number, min: 0, max: 100 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound indexes for fast availability queries
bookingSchema.index({ user_id: 1, check_in: 1 });
bookingSchema.index(
  { hotel_id: 1, check_in: 1, check_out: 1 },
  { partialFilterExpression: { status: { $ne: 'canceled' } } },
);
bookingSchema.index({ status: 1, payment_status: 1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = model<IBookingDocument>('Booking', bookingSchema);
