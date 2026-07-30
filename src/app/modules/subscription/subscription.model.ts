import { model, Schema } from "mongoose";
import { ISubscription, SubscriptionModel } from "./subscripton.interface";

const subscriptionSchema = new Schema<ISubscription,SubscriptionModel>({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  txId: {
    type: String,
    required: true,
  },
  package: {
    type: Schema.Types.ObjectId,
    ref: 'Package',
    required: false,
  },
  modules: {
    type: [Number],
    required: true,
  },
  addons: {
    type: [Schema.Types.ObjectId],
    required: false,
    default: [],
  },
  vanues: {
    type:Number,
    default:0,
  },
  programmes: {
    type:Number,
    default:0,
  },
  is_proggramme_sell: {
    type:Boolean,
    default:false,
  },
  minimum_programme_price: {
    type:Number,
    default:0,
  },
},{
    timestamps:true
});

subscriptionSchema.index({user: 1})

export const  Subscription = model<ISubscription, SubscriptionModel>('Subscription', subscriptionSchema);