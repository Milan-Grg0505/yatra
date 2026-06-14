import { Schema, model, Document, Types } from 'mongoose';

export interface IPhotoDocument extends Document {
  _id: Types.ObjectId;
  url: string;
  public_id?: string;
  hotel_id: Types.ObjectId;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<IPhotoDocument>(
  {
    url: { type: String, required: true },
    public_id: { type: String },
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    caption: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Photo = model<IPhotoDocument>('Photo', photoSchema);

/* ----------------- PropertyPhoto ----------------- */
export interface IPropertyPhotoDocument extends Document {
  _id: Types.ObjectId;
  url: string;
  public_id?: string;
  hotel_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const propertyPhotoSchema = new Schema<IPropertyPhotoDocument>(
  {
    url: { type: String, required: true },
    public_id: { type: String },
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
  },
  { timestamps: true },
);

export const PropertyPhoto = model<IPropertyPhotoDocument>('PropertyPhoto', propertyPhotoSchema);
