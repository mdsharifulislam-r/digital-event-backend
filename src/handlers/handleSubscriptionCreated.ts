import mongoose from 'mongoose';
import Stripe from 'stripe';

import stripe from '../config/stripe';
import { Package } from '../app/modules/package/package.model';
import { User } from '../app/modules/user/user.model';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { RedisHelper } from '../tools/redis/redis.helper';
import { Transaction } from '../app/modules/transaction/transaction.model';
import { TRANSACTION_PAYMENT_TYPE, TRANSACTION_STATUS, TRANSACTION_TYPE } from '../enums/transaction';
import { sendNotifications, sendNotificationsAdmin } from '../helpers/notificationHelper';

export const handleSubscriptionCreated = async (event: Stripe.Subscription) => {
  const mongooseSession = await mongoose.startSession();
  try {
    mongooseSession.startTransaction();
    // console.log(event);

    const subscription: any = await stripe.subscriptions.retrieve(event.id);

    // console.log(subscription);

    // const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);

    if (!subscription) {
      console.log('subscription not found');
      return;
    }
    // console.log(subscription);

    const price_id = subscription?.items?.data[0]?.price.id;
    if (!price_id) {
      console.log('price_id not found');
      return;
    }
    const packageData = await Package.findOne({ priceId: price_id }).lean();
    if (!packageData) {
      console.log('package not found');
      return;
    }
    const customer = await stripe.customers.retrieve(
      subscription.customer as string,
    );
    if (!customer) {
      console.log('customer not found');
      return;
    }

    const user = await User.findOne({ email: (customer as any).email }).lean();

    if (!user) {
      console.log('user not found');
      return;
    }

    const existingSubscription = await Subscription.findById(user.subscription);
    if (existingSubscription) {
      await Subscription.findByIdAndUpdate(
        user.subscription,
        { status: 'inactive' },
        { session: mongooseSession },
      );
    }

    const startDate = new Date(subscription.start_date * 1000);

    let endDate = new Date(startDate);

    const interval = subscription?.plan?.interval;
    const intervalCount = subscription?.plan?.interval_count || 1;

    if (interval === 'month') {
      endDate.setMonth(endDate.getMonth() + intervalCount);
    } else if (interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + intervalCount);
    } else if (interval === 'week') {
      endDate.setDate(endDate.getDate() + 7 * intervalCount);
    } else if (interval === 'day') {
      endDate.setDate(endDate.getDate() + intervalCount);
    }

    const newSubscription = await Subscription.create({
      subscriptionId: event.id,
      status: 'active',
      user: user._id,
      package: packageData._id,
      startDate: startDate,
      endDate: endDate,
      price: packageData.priceMonthly,
      txId: subscription.id,
      name: packageData.label,
      modules: packageData.modules,
      vanues: packageData?.vanues,
      programmes: packageData?.programmes,
      is_proggramme_sell: packageData?.is_proggramme_sell,
      minimum_programme_price: packageData?.minimum_programme_price
    });

    await User.findByIdAndUpdate(
      user._id,
      { subscription: newSubscription._id },
      { session: mongooseSession },
    );

    await Promise.all([
        Transaction.create({
            amount: packageData.priceMonthly,
            owner: user._id,
            user: user._id,
            title: `Purchase for ${packageData.label}'s programme`,
            type: TRANSACTION_TYPE.SUBSCRIPTION,
            payment_status: TRANSACTION_PAYMENT_TYPE.CREDIT,
            status: TRANSACTION_STATUS.COMPLETED,
            proggramme: newSubscription._id,
            platform_charge: packageData.priceMonthly,
        }),
        sendNotifications({
            title: `You have successfully subscribed to ${packageData.label}`,
            message: `You have successfully subscribed to ${packageData.label}`,
            receiver: [user._id],
            isRead: false,
            filePath: 'subscription',
            referenceId: newSubscription._id
        }),
        sendNotificationsAdmin({
            title: `New Subscription`,
            message: `${user.name} has successfully subscribed to ${packageData.label}`,
            isRead: false,
            filePath: 'subscription',
            referenceId: newSubscription._id
        })
    ]);

    await mongooseSession.commitTransaction();
    await mongooseSession.endSession();

    console.log('subscription Successfull');
    await RedisHelper.HKeyDelete(`user:${user._id}:transactions`);
  } catch (error) {
    await mongooseSession.abortTransaction();
    await mongooseSession.endSession();
    console.log(error);
  }
};
