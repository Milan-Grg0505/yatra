import { Schema, model, Document, Types } from 'mongoose';
import { ReviewStatus } from '../types';

export interface IReviewDocument extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  hotel_id: Types.ObjectId;
  booking_id: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  helpful_count: number;
  helpful_by: Types.ObjectId[];
  reported: boolean;
  owner_response?: string;
  owner_response_date?: Date;
  status: ReviewStatus;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentiment_score?: number;
  topics: string[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    booking_id: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    images: [{ type: String }],
    helpful_count: { type: Number, default: 0, min: 0 },
    helpful_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reported: { type: Boolean, default: false },
    owner_response: { type: String, maxlength: 1000 },
    owner_response_date: { type: Date },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'] },
    sentiment_score: { type: Number, min: -1, max: 1 },
    topics: [{ type: String, lowercase: true, trim: true }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

reviewSchema.index({ hotel_id: 1, status: 1 });
reviewSchema.index({ user_id: 1, booking_id: 1 }, { unique: true });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

export const Review = model<IReviewDocument>('Review', reviewSchema);
