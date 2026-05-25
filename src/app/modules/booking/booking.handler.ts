import { Types } from 'mongoose';
import { Transaction } from '../transaction/transaction.model';
import { IBooking } from './booking.interface';
import { Event } from '../event/event.model';
import {
  TRANSACTION_PAYMENT_TYPE,
  TRANSACTION_TYPE,
} from '../../../enums/transaction';

const createInitialTrxsection = async (bookingId: IBooking) => {
  try {
    const event = await Event.findById(bookingId.event).lean();
    await Promise.all([
      Transaction.create({
        title: `Purchase for ${event?.title}'s programme`,
        amount: bookingId.price,
        type: TRANSACTION_TYPE.PAYMENT,
        order: (bookingId as any)._id as Types.ObjectId,
        organization: bookingId.organization,
        owner: bookingId.user,
        user: bookingId.user,
        proggramme: bookingId.programme,
        payment_status: TRANSACTION_PAYMENT_TYPE.CREDIT,
        platform_charge:0
      }),

      Transaction.create({
        title: `Platform charge for ${event?.title}'s programme`,
        amount: event?.price,
        type: TRANSACTION_TYPE.PAYMENT,
        order: (bookingId as any)._id as Types.ObjectId,
        organization: bookingId.organization,
        owner: bookingId.organization,
        user: bookingId.user,
        proggramme: bookingId.programme,
        payment_status: TRANSACTION_PAYMENT_TYPE.DABIT,
        platform_charge:0
      }),
    ]);
  } catch (error) {
    console.error('Error creating initial transaction:', error);
  }
};


export const BookingHandler = {
  createInitialTrxsection,
};
