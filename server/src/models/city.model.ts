import { Schema, model, Document, Types } from 'mongoose';

export interface ICityDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  image?: string;
  country?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<ICityDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    image: { type: String },
    country: { type: String, default: 'Nepal' },
    description: { type: String, trim: true },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
  },
  { timestamps: true },
);

citySchema.index({ name: 'text' });

export const City = model<ICityDocument>('City', citySchema);
