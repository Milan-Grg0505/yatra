import { Schema, model, Document, Types } from 'mongoose';

export interface INearbyLandmark {
  name: string;
  type: 'restaurant' | 'atm' | 'hospital' | 'attraction' | 'transport' | 'shopping';
  distance_km: number;
  coordinates: { type: 'Point'; coordinates: [number, number] };
}

export interface ILocationDocument extends Document {
  _id: Types.ObjectId;
  hotel_id?: Types.ObjectId;
  city: string;
  country: string;
  region: string;
  address?: string;
  street?: string;
  zip_code?: string;
  coordinates?: { type: 'Point'; coordinates: [number, number] };
  nearby_landmarks: INearbyLandmark[];
  createdAt: Date;
  updatedAt: Date;
}

const nearbyLandmarkSchema = new Schema<INearbyLandmark>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['restaurant', 'atm', 'hospital', 'attraction', 'transport', 'shopping'],
      required: true,
    },
    distance_km: { type: Number, required: true, min: 0 },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
  },
  { _id: false },
);

const locationSchema = new Schema<ILocationDocument>(
  {
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', index: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'Nepal' },
    region: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    street: { type: String, trim: true },
    zip_code: { type: String, trim: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
    nearby_landmarks: [nearbyLandmarkSchema],
  },
  { timestamps: true },
);

locationSchema.index({ coordinates: '2dsphere' });

export const Location = model<ILocationDocument>('Location', locationSchema);
