import { Schema, model, Document, Types } from 'mongoose';

export interface IHeroDocument extends Document {
  _id: Types.ObjectId;
  image: string;
  public_id?: string;
  title: string;
  subTitle: string;
  description: string;
  link?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const heroSchema = new Schema<IHeroDocument>(
  {
    image: { type: String, required: true },
    public_id: { type: String },
    title: { type: String, required: true, trim: true },
    subTitle: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Hero = model<IHeroDocument>('Hero', heroSchema);
