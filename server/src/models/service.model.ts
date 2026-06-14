import { Schema, model, Document, Types } from 'mongoose';

export interface IServiceDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  icon?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IServiceDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Service = model<IServiceDocument>('Service', serviceSchema);
