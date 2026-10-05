import { Schema, model } from 'mongoose';
import { IBooking, BookingModel, IFreeDownLoad, FreeDownLoadModel } from './booking.interface'; 
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
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

bookingSchema.pre('save', async function(next) {
  BookingHandler.createInitialTrxsection(this);
  next();
});

export const Booking = model<IBooking, BookingModel>('Booking', bookingSchema);


const freeDownLoadSchema = new Schema<IFreeDownLoad, FreeDownLoadModel>({
  programme: { type: Schema.Types.ObjectId, ref: 'Programmes', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['registered', 'paid', 'inProgress'], default: 'registered' },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  month_id: { type: String, required: false },
  download_fee: { type: Number, default: 0 },
}, {
  timestamps: true,
});

freeDownLoadSchema.pre('save', async function(next) {
  this.month_id = new Date().toISOString().slice(0, 7);
  next();
});

export const FreeDownLoad = model<IFreeDownLoad, FreeDownLoadModel>('FreeDownLoad', freeDownLoadSchema);
