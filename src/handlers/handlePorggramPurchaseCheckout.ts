import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Booking } from '../app/modules/booking/booking.model';
import { Transaction } from '../app/modules/transaction/transaction.model';
import { TRANSACTION_STATUS } from '../enums/transaction';
import stripe from '../config/stripe';
import { sendNotifications } from '../helpers/notificationHelper';
import { Event } from '../app/modules/event/event.model';
import { RedisHelper } from '../tools/redis/redis.helper';

export const handleProgrammePurchaseCheckout = async (
  session: Stripe.Checkout.Session,
) => {
  const mongoSession = await mongoose.startSession();
  const { bookingId } = session.metadata || {};
  try {
    await mongoSession.startTransaction();

    if (!bookingId) {
      throw new Error('Booking ID not found in session metadata');
    }

    const booking = await Booking.findById(bookingId)
      .populate('user')
      .session(mongoSession);

    if (!booking) {
      throw new Error('Booking not found');
    }

    await Promise.all([
      Booking.updateOne(
        { _id: bookingId },
        { status: 'confirmed', payment_status: 'paid' },
        { session: mongoSession },
      ),
      Event.updateOne(
        { _id: booking.event },
        { $inc: { downloads_count: 1, revinge_count: booking.price } },
        { session: mongoSession },
      ),
      Transaction.updateMany(
        { order: bookingId },
        { status: TRANSACTION_STATUS.COMPLETED },
        { session: mongoSession },
      ),
      RedisHelper.keyDelete(`event:${booking.event}:${booking.user._id}:*`),
    ]);

    sendNotifications({
      title: 'Programme purchase',
      message: 'You have successfully purchased a programme',
      receiver: [booking.user._id],
      filePath: 'booking',
      isRead: false,
    });

    sendNotifications({
      title: 'Programme purchase',
      message: `${(booking.user as any).name} have purchased a programme`,
      receiver: [booking.organization],
      filePath: 'booking',
      isRead: false,
    });

    await mongoSession.commitTransaction();
    await mongoSession.endSession();
  } catch (error) {
    await mongoSession.abortTransaction();
    await mongoSession.endSession();

    await Transaction.updateMany(
      { order: bookingId },
      { status: TRANSACTION_STATUS.FAILED },
    );
    await stripe.refunds.create({
      payment_intent: session.payment_intent as string,
    });
  }
};
