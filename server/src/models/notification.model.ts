import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_canceled'
  | 'review_response'
  | 'review_approved'
  | 'payment_success'
  | 'payment_failed'
  | 'hotel_approved'
  | 'hotel_rejected'
  | 'travel_booking'
  | 'system';

export interface INotificationDocument extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  read_at?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'booking_confirmed',
        'booking_canceled',
        'review_response',
        'review_approved',
        'payment_success',
        'payment_failed',
        'hotel_approved',
        'hotel_rejected',
        'travel_booking',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    read: { type: Boolean, default: false, index: true },
    read_at: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ user_id: 1, read: 1, createdAt: -1 });

export const Notification = model<INotificationDocument>('Notification', notificationSchema);
