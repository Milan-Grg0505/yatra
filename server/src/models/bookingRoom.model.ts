import { Schema, model, Document, Types } from 'mongoose';

export interface IBookingRoomDocument extends Document {
  _id: Types.ObjectId;
  booking_id: Types.ObjectId;
  room_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookingRoomSchema = new Schema<IBookingRoomDocument>(
  {
    booking_id: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    room_id: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  },
  { timestamps: true },
);

export const BookingRoom = model<IBookingRoomDocument>('BookingRoom', bookingRoomSchema);
