import { Document, model, Model, Schema, Types } from "mongoose";
import { Role, TravelStyle } from "../types";
import { env } from "../config/env";
import bcrypt from "bcryptjs";

export interface IUser {
  name: string;
  email: string;
  image?: string;
  password?: string;
  phone?: string;
  address?: string;
  hotel?: Types.ObjectId | null;
  role: Role;
  google_id?: string;
  isEmailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    currency: string;
    notifications: boolean;
  };
  travel_style: TravelStyle[];
  favorite_hotels: Types.ObjectId[];
  wishlist: Types.ObjectId[];
  last_login?: Date;
  reset_password_token?: string;
  reset_password_expires?: Date;
  deleted_at?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser,
  Document {
  _id: Types.ObjectId;
  comparePassword(plain: string): Promise<boolean>;
}

interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {

    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    image: { type: String },
    password: { type: String, minlength: 8, select: false },
    phone: { type: String, match: [/^\d{10,15}$/, 'Invalid phone'] },
    address: { type: String, trim: true },
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', default: null },
    role: { type: String, enum: ['admin', 'user', 'owner'], default: 'user', index: true },
    google_id: { type: String, unique: true, sparse: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    preferences: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'NPR' },
      notifications: { type: Boolean, default: true },
    },
    travel_style: [
      { type: String, enum: ['luxury', 'budget', 'adventure', 'family', 'business', 'solo'] },
    ],
    favorite_hotels: [{ type: Schema.Types.ObjectId, ref: 'Hotel' }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Hotel' }],
    last_login: { type: Date },
    reset_password_token: { type: String, select: false },
    reset_password_expires: { type: Date, select: false },
    deleted_at: { type: Date, default: null, index: true },

  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      //A function that runs before the document is converted to JSON. It allows you to modify the output object.
      transform(_doc, ret: any) {
        ret.id = ret._id; // Automatically removes sensitive fields(password, reset tokens) before sending to client
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.reset_password_token;
        delete ret.reset_password_expires;
        return ret;
      },
    },
  },
);

userSchema.index({ 'preferences.travel_style': -1 });
userSchema.index({ 'last_login': -1 });;

userSchema.pre('save', async function () {
  // Only run if password field was modified
  if (!this.isModified('password')) {
    return;
  }

  // Check if password exists
  if (!this.password) {
    throw new Error('Password is required');
  }

  const salt = await bcrypt.genSalt(env.BCRYPT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

// to compare password
userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
}

// to find user by email
userSchema.statics.findByEmail = async function (email: string): Promise<IUserDocument | null> {
  return this.findOne({ email }).select('+password');
}

export const User = model<IUserDocument, IUserModel>('User', userSchema);