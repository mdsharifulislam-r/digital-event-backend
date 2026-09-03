import { Request, Response } from "express";
import stripe from "../config/stripe";
import config from "../config";
import { handlePurchaseCheckout } from "../handlers/handlePurchaseCheckout";
import { handleProgrammePurchaseCheckout } from "../handlers/handlePorggramPurchaseCheckout";
import { handleSubscriptionCreated } from "../handlers/handleSubscriptionCreated";
import { handleAddonAttach } from "../handlers/handleAddonAttach";
import { handleAccountUpdatedEvent } from "../handlers/handleAccountUpdatedEvent";

export const handleStripeWebhook = async (req: Request, res: Response) => {
    try {
        const sig = req.headers['stripe-signature'];
        let event = await stripe.webhooks.constructEvent(req.body, sig!, config.stripe.webhook_secret!);

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                if((session.metadata)?.bookingId){
                    await handleProgrammePurchaseCheckout(session);
                }
                if((session.metadata)?.addonId){
                    await handleAddonAttach(session);
                }
                break;
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            case 'account.updated':
                await handleAccountUpdatedEvent(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.log(error);
        
    }
}