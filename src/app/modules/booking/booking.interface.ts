import { Model, Types } from 'mongoose';

export type IBooking = {
  programme: Types.ObjectId;
  user: Types.ObjectId;
  event: Types.ObjectId;
  status: 'pending' | 'confirmed' | 'cancelled';
  booking_date: Date;
  price: number;
  organization: Types.ObjectId;
  trx_id: string;
  payment_status: "paid" | "unpaid"

};

export type BookingModel = Model<IBooking>;
