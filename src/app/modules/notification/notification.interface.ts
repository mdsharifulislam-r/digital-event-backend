import { Model, Types } from "mongoose";
import { IEvent } from "../event/event.interface";

export type INotification = {
  receiver?: Types.ObjectId[];
  title: string;
  message: string;
  owner?: Types.ObjectId;
  isRead: boolean;
  createdAt?: Date;
  filePath?: "booking" | "payment" | "general" | "review" | 'referral' | 'subscription';
  referenceId?: Types.ObjectId;
  readers?: Types.ObjectId[];
};

export type NotificationModel = Model<INotification>;

export type ISendNotification = {
  target:"all_proggame_holders" | "specific_event" | "specific_vanue"
  event?: Types.ObjectId;
  vanue?: Types.ObjectId;
  performance?: IEvent['performances'][0];
  title: string;
  message: string;
  filePath?: "booking" | "payment" | "general" | "review" | 'referral' | 'subscription';
  referenceId?: Types.ObjectId;
}
