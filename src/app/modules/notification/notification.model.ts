import { model, Schema, Types } from "mongoose";
import { INotification, NotificationModel } from "./notification.interface";

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    title: {
      type: String,
      required: true,
    },
    receiver: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    message: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    readers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    extraPath: {
      type: String,
    }
  },

  {
    timestamps: true,
  }
);

export const Notification = model<INotification, NotificationModel>(
  "Notification",
  notificationSchema
);
