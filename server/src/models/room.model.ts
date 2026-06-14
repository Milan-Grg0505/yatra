import { Document, Schema, Types } from "mongoose";
import { ViewType } from "../types";
import { model } from "mongoose";

export interface IRoom {
  hotel_id: Types.ObjectId,
  room_type: 'single' | 'double' | 'suite' | 'deluxe' | 'family' | 'other';
  room_name: string;
  numberOf_rooms: number;
  bed_type: 'single' | 'double' | 'queen' | 'king' | 'bunk' | 'sofa' | 'other';
  numberOf_beds: number;
  smoking_policy: 'smoking' | 'non-smoking' | 'both';
  base_price: number;
  max_guest: number;
  roomSize?: string;
  services: Types.ObjectId[];
  discount_percentage: number;
  weekend_price?: number;
  festival_price?: number;
  images: string[];
  amenities: string[];
  view_type: ViewType;
  floor_number?: number;
  has_ac: boolean;
  has_wifi: boolean;
  has_tv: boolean;
  has_minibar: boolean;
  has_safe: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomDocument extends IRoom, Document {
  _id: Types.ObjectId;
}

const roomSchema = new Schema<IRoomDocument>(
  {
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    room_type: {
      type: String,
      enum: ['single', 'double', 'suite', 'deluxe', 'family', 'other'],
      default: 'single',
    },
    room_name: { type: String, required: true, trim: true },
    numberOf_rooms: { type: Number, required: true, min: 1 },
    bed_type: {
      type: String,
      enum: ['single', 'double', 'queen', 'king', 'bunk', 'sofa', 'other'],
      default: 'double',
    },
    numberOf_beds: { type: Number, required: true, min: 1 },
    smoking_policy: { type: String, enum: ['smoking', 'non-smoking', 'both'], default: 'non-smoking' },
    base_price: { type: Number, required: true, min: 0 },
    max_guest: { type: Number, required: true, min: 1 },
    roomSize: { type: String, trim: true },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],

    discount_percentage: { type: Number, default: 0, min: 0, max: 100 },
    weekend_price: { type: Number, min: 0 },
    festival_price: { type: Number, min: 0 },
    images: [{ type: String }],
    amenities: [{ type: String, trim: true }],
    view_type: {
      type: String,
      enum: ['city', 'mountain', 'garden', 'pool', 'ocean', 'none'],
      default: 'none',
    },
    floor_number: { type: Number, min: 0 },
    has_ac: { type: Boolean, default: false },
    has_wifi: { type: Boolean, default: true },
    has_tv: { type: Boolean, default: false },
    has_minibar: { type: Boolean, default: false },
    has_safe: { type: Boolean, default: false },
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

roomSchema.index({ hotel_id: 1, base_price: 1 });

export const Room = model<IRoomDocument>('Room', roomSchema);
