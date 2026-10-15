import Stripe from "stripe";
import { OrganisationBilling } from "../app/modules/user/user.model";
import stripe from "../config/stripe";
import mongoose from "mongoose";

export const handleSetupIntentEvent = async (intent: Stripe.SetupIntent) => {
  console.log(intent);
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
         if (
            typeof intent.customer !== "string" ||
            typeof intent.payment_method !== "string"
          ) throw new Error("Invalid intent");

          const billing =
            await OrganisationBilling.findOne({
              organisationId: intent?.metadata?.organisationId,
              stripeCustomerId: intent.customer,
            }).session(session);

          // Never trust metadata alone. Match the Customer
          // against your own organisation record.
          if (!billing) throw new Error("Invalid intent");

          await stripe.customers.update(
            intent.customer,
            {
              invoice_settings: {
                default_payment_method:
                  intent.payment_method,
              },
            }
          );

          billing.defaultPaymentMethodId =
            intent.payment_method;
          billing.cardStatus = "ready";
          await billing.save({session});

          await session.commitTransaction();
          session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
    }
};