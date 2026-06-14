import { Schema, model, Document, Types } from 'mongoose';

export interface IPolicyDocument extends Document {
  _id: Types.ObjectId;
  hotel_id: Types.ObjectId;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const policySchema = new Schema<IPolicyDocument>(
  {
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

export const Policy = model<IPolicyDocument>('Policy', policySchema);
