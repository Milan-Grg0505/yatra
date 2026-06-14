import { Document, model, Model, Schema, Types } from "mongoose";
import { CancellationPolicy, HotelStatus, HotelType } from "../types";

export interface IHotel {
  name: string;
  email?: string;
  password?: string;
  phone?: string;
  pan_number?: string;
  logo?: string;
  description?: string;
  registration_number?: string;
  rating_count: number;
  rating: number;
  type: HotelType;
  city_id?: Types.ObjectId;
  status: HotelStatus;
  facilities: Types.ObjectId[];
  owner_id?: Types.ObjectId;

  // location
  latitude?: number;
  longitude?: number;
  location_coordinates?: {
    type: "Point";
    coordinates: [number, number];
  };

  address?: string;
  street?: string;
  zip_code?: string;

  // Operations
  check_in_time: string;
  check_out_time: string;
  cancellation_policy: CancellationPolicy;
  cancellation_deadline_hours: number;
  cancellation_fee_percentage: number;
  tax_percentage: number;
  service_charge_percentage: number;
  min_advance_booking_days: number;
  max_advance_booking_days: number;
  min_stay_nights: number;


  // Aggregates
  average_review_rating: number;
  total_reviews: number;
  view_count: number;
  booking_count: number;
  popularity_score: number;

  deleted_at?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}


export interface IHotelDocument extends IHotel, Document {
  _id: Types.ObjectId;
}

const hotelSchema = new Schema<IHotelDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: String, minlength: 8, select: false, trim: true },
    phone: { type: String, match: /^\d{10,15}$/ },
    pan_number: { type: String, uppercase: true, match: /^[A-Z]{5}\d{4}[A-Z]$/ },
    logo: { type: String },
    description: { type: String, trim: true },
    registration_number: { type: String, trim: true },
    rating_count: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    type: { type: String, enum: ['resort', 'hostel', 'hotel', 'homestay', 'other'], default: 'hotel' },
    city_id: { type: Schema.Types.ObjectId, ref: 'City', index: true },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending', index: true },
    facilities: [{ type: Schema.Types.ObjectId, ref: 'Facility' }],
    owner_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },

    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    location_coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
    address: { type: String, trim: true },
    street: { type: String, trim: true },
    zip_code: { type: String, trim: true },

    check_in_time: { type: String, default: '14:00' },
    check_out_time: { type: String, default: '12:00' },
    cancellation_policy: { type: String, enum: ['free', 'flexible', 'moderate', 'strict'], default: 'flexible' },
    cancellation_deadline_hours: { type: Number, default: 24, min: 0 },
    cancellation_fee_percentage: { type: Number, default: 0, min: 0, max: 100 },
    tax_percentage: { type: Number, default: 13, min: 0, max: 100 },
    service_charge_percentage: { type: Number, default: 10, min: 0, max: 100 },
    min_advance_booking_days: { type: Number, default: 0, min: 0 },
    max_advance_booking_days: { type: Number, default: 365, min: 1 },
    min_stay_nights: { type: Number, default: 1, min: 1 },

    average_review_rating: { type: Number, default: 0, min: 0, max: 5 },
    total_reviews: { type: Number, default: 0, min: 0 },
    view_count: { type: Number, default: 0, min: 0 },
    booking_count: { type: Number, default: 0, min: 0 },
    popularity_score: { type: Number, default: 0, min: 0, index: true },

    deleted_at: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },

);

hotelSchema.virtual('rooms', {
  ref: "Room",
  localField: "_id",
  foreignField: "hotel_id"
});

hotelSchema.virtual('photos', {
  ref: "Photo",
  localField: "_id",
  foreignField: "hotel_id"
});

// Indexes
//Enables geospatial queries like "find hotels near me"
hotelSchema.index({ location_coordinates: '2dsphere' });
//For filtering by status and location
hotelSchema.index({ status: 1, city_id: 1 });
//For sorting by rating and popularity
hotelSchema.index({ rating: -1, popularity_score: -1 });
//For filtering by rating
hotelSchema.index({ average_review_rating: -1 });
//Combined filters and sorting
hotelSchema.index({ city_id: 1, status: 1, average_review_rating: -1 });
//For full-text search
hotelSchema.index({ name: 'text', description: 'text' });

export const Hotel = model<IHotelDocument>('Hotel', hotelSchema);

