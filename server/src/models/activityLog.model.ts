import { Schema, model, Document, Types } from 'mongoose';

export type ActivityType =
  | 'login'
  | 'logout'
  | 'register'
  | 'booking'
  | 'review'
  | 'profile_update'
  | 'password_change'
  | 'wishlist'
  | 'search'
  | 'travel_booking'
  | 'payment';

export interface IActivityLogDocument extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  action: string;
  action_type: ActivityType;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLogDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, trim: true },
    action_type: {
      type: String,
      enum: [
        'login',
        'logout',
        'register',
        'booking',
        'review',
        'profile_update',
        'password_change',
        'wishlist',
        'search',
        'travel_booking',
        'payment',
      ],
      required: true,
      index: true,
    },
    details: { type: Schema.Types.Mixed },
    ip_address: { type: String },
    user_agent: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

activityLogSchema.index({ user_id: 1, timestamp: -1 });
activityLogSchema.index({ action_type: 1, timestamp: -1 });

export const ActivityLog = model<IActivityLogDocument>('ActivityLog', activityLogSchema);
