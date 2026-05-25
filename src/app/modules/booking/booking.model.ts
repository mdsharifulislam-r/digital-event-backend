import { Schema, model } from 'mongoose';
import { IBooking, BookingModel } from './booking.interface'; 
import { BookingHandler } from './booking.handler';

const bookingSchema = new Schema<IBooking, BookingModel>({
  programme: { type: Schema.Types.ObjectId, ref: 'Programmes', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  booking_date: { type: Date, default: Date.now },
  price: { type: Number, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  trx_id: { type: String },
  payment_status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
}, {
  timestamps: true,
});

bookingSchema.pre('save', async function(next) {
  BookingHandler.createInitialTrxsection(this);
  next();
});

export const Booking = model<IBooking, BookingModel>('Booking', bookingSchema);
