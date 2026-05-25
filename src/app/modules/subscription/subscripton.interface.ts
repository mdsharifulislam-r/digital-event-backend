import { Model, Types } from "mongoose";

export type ISubscription = {
    name: string;
    price: number;
    startDate: Date;
    endDate: Date;
    status: "active" | "expired";
    user: Types.ObjectId;
    txId: string;
    package?: Types.ObjectId;
    modules:number[],
    addons:Types.ObjectId[]
}

export  type SubscriptionModel = Model<ISubscription, Record<string, any>>;