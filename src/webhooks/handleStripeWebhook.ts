import { Request, Response } from 'express';
import stripe from '../config/stripe';
import config from '../config';
import { handlePurchaseCheckout } from '../handlers/handlePurchaseCheckout';
import { handleProgrammePurchaseCheckout } from '../handlers/handlePorggramPurchaseCheckout';
import { handleSubscriptionCreated } from '../handlers/handleSubscriptionCreated';
import { handleAddonAttach } from '../handlers/handleAddonAttach';
import { handleAccountUpdatedEvent } from '../handlers/handleAccountUpdatedEvent';
import Stripe from 'stripe';
import { handleSetupIntentEvent } from '../handlers/handleSetupIntentEvent';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event = await stripe.webhooks.constructEvent(
      req.body,
      sig!,
      config.stripe.webhook_secret!,
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        if (session.metadata?.bookingId) {
          await handleProgrammePurchaseCheckout(session);
        }
        if (session.metadata?.addonId) {
          await handleAddonAttach(session);
        }
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'account.updated':
        await handleAccountUpdatedEvent(event.data.object);
        break;
      case 'setup_intent.succeeded':
        await handleSetupIntentEvent(event.data.object as Stripe.SetupIntent);
        break;
      case 'setup_intent.setup_failed':
        console.log('SetupIntent setup failed');
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
