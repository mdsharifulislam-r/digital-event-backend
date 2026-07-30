import { Model, Types } from "mongoose";
import { IEvent } from "../event/event.interface";

export type INotification = {
  receiver?: Types.ObjectId[];
  title: string;
  message: string;
  owner?: Types.ObjectId;
  isRead: boolean;
  createdAt?: Date;
  filePath?: "booking" | "payment" | "general" | "review" | 'referral' | 'subscription' | 'support'
  referenceId?: Types.ObjectId;
  extraPath?: string;
  readers?: Types.ObjectId[];
};

export type NotificationModel = Model<INotification>;

export type ISendNotification = {
  target: "all_proggame_holders" | "specific_event" | "specific_vanue" | "specific_performance";
  event?: Types.ObjectId;
  vanue?: Types.ObjectId;
  performance?: string
  title: string;
  message: string;
  filePath?: "booking" | "payment" | "general" | "review" | 'referral' | 'subscription';
  referenceId?: Types.ObjectId;
  extraPath?: string
  is_only_proggram_holder?: boolean
}
