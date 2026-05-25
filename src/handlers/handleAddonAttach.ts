import mongoose from "mongoose";
import Stripe from "stripe";
import { Addon } from "../app/modules/addon/addon.model";
import { Subscription } from "../app/modules/subscription/subscription.model";
import { sendNotifications } from "../helpers/notificationHelper";
import { Transaction } from "../app/modules/transaction/transaction.model";
import { TRANSACTION_PAYMENT_TYPE, TRANSACTION_STATUS, TRANSACTION_TYPE } from "../enums/transaction";

export const handleAddonAttach =async (session: Stripe.Checkout.Session) => {
    const mongoSession =await mongoose.startSession();

    try {
        mongoSession.startTransaction();
        const {addonId,userId} = session.metadata || {};
        const addon = await Addon.findOne({ _id: addonId }).session(mongoSession);
        if (!addon) {
            throw new Error('Addon not found');
        }
        
        const subscription = await Subscription.findOne({ user: userId,status:"active" }).session(mongoSession)
        if(!subscription){
            throw new Error('Subscription not found');
        }
        subscription.modules?.push(addon.linkedModule!)
        subscription.addons?.push(addon._id)
        await subscription.save({session:mongoSession})
        sendNotifications({
            title:"New Module Added",
            message:"You have a new module added to your subscription",
            receiver:[subscription.user!],
            isRead:false,
            filePath:"general",
            referenceId:subscription._id
        })
        await Transaction.create({
            title:`Addon ${addon.label} attached to subscription`,
            owner:subscription.user!,
            amount:addon.priceMonthly,
            type:TRANSACTION_TYPE.PAYMENT,
            platform_charge:addon.priceMonthly,
            status:TRANSACTION_STATUS.COMPLETED,
            payment_status:TRANSACTION_PAYMENT_TYPE.CREDIT,
        })
        await mongoSession.commitTransaction();
        mongoSession.endSession();

        
    } catch (error) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        console.log(error);
        
    }
};