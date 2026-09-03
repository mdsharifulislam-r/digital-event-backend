import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';

import stripe from '../config/stripe';
import ApiError from '../errors/ApiError';
import mongoose from 'mongoose';
import { TempHoldWallet, User } from '../app/modules/user/user.model';
    

export const handleAccountUpdatedEvent = async (data: Stripe.Account) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
            // Find the user by Stripe account ID
    const existingUser = await User.findOne({ stripe_account_id: data.id }).session(session);

    if (!existingUser) {
        return console.log('User not found');
    }

    // Check if the onboarding is complete
    if (data.charges_enabled) {
        const loginLink = await stripe.accounts.createLoginLink(data.id);

        // Save Stripe account information to the user record
        await User.findByIdAndUpdate(existingUser?._id, {
            stripe_account_id: data.id,
            stripe_login_link: loginLink.url
        },{session});

        const tempHoldWallet = await TempHoldWallet.findOne({ userId: existingUser._id }).session(session);
        if (tempHoldWallet?.amount||0>0) {
            await stripe.transfers.create({
                amount: Math.round(tempHoldWallet?.amount! * 100), // amount in cents
                currency: 'usd',
                destination: data.id!,
                transfer_group: 'temp_hold_wallet',
            });
            await TempHoldWallet.findByIdAndDelete(tempHoldWallet!._id,{session});
        }
    }

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}