import { Schema, model, Document, Types } from 'mongoose';

export interface IFacilityDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  icon?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const facilitySchema = new Schema<IFacilityDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Facility = model<IFacilityDocument>('Facility', facilitySchema);
