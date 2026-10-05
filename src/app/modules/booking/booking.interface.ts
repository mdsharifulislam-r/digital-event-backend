import { Model, Types } from 'mongoose';

export type IBooking = {
  programme: Types.ObjectId;
  user: Types.ObjectId;
  event: Types.ObjectId;
  status: 'pending' | 'confirmed' | 'cancelled';
  booking_date: Date;
  price: number;
  isDeleted: boolean;
  organization: Types.ObjectId;
  trx_id: string;
  payment_status: "paid" | "unpaid"

};

export type BookingModel = Model<IBooking>;



export type IFreeDownLoad = {
  programme: Types.ObjectId;
  user: Types.ObjectId;
  organization: Types.ObjectId;
  status:"registered"|"paid"|"inProgress"
  booking:Types.ObjectId
  month_id:string,
  download_fee ?: number
}


export type FreeDownLoadModel = Model<IFreeDownLoad>;
