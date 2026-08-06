import { JwtPayload } from 'jsonwebtoken';
import { Notification } from './notification.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Types } from 'mongoose';
import { ISendNotification } from './notification.interface';
import { NotificationHelper } from './notification.helper';
import { sendNotifications } from '../../../helpers/notificationHelper';

// Just for single notification update to db
const updateNotificationToDB = async (id: string, user: JwtPayload) => {
  const result = await Notification.findOneAndUpdate(
    { _id: id, readers: { $nin: [new Types.ObjectId(user.id)] } },
    { $addToSet: { readers: user.id } },
    { new: true },
  );
  return result;
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (user: JwtPayload) => {
  const userObjectId = new Types.ObjectId(user.id);
  const result = await Notification.updateMany(
    {
      receiver: {
        $in: [user.id],
      },
    },
    { $addToSet: { readers: user.id } },
  );
  return result;
};

// Get all notifications
const allNotificationFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  if (query.date) {
    query.date = new Date(query.date);
  }

  const initialQuery = Notification.find({
    receiver: {
      $in: [user.id],
    },
    ...(query.date && { createdAt: { $gte: query.date } }),
  });

  const result = new QueryBuilder(initialQuery, query).sort().paginate();

  let unreadCount = await Notification.countDocuments({
    receiver: {
      $in: [user.id],
    },
    readers: {
      $nin: [user.id],
    },
  });

  const [data, pagination] = await Promise.all([
    result.modelQuery.lean(),
    result.getPaginationInfo(),
  ]);

  return {
    pagination,
    data: {
      unreadCount,
      data: data?.map((notification: any) => ({
        ...notification,
        isRead: notification.readers
          ?.map((reader: any) => reader.toString())
          ?.includes(user?.id),
      })),
    },
  };
};

const sendPushNotification = async (
  payload: ISendNotification,
  user: JwtPayload,
) => {
  try {
    const users = await NotificationHelper.gotUsersForNotification(
      payload,
      user.id,
    );
    await sendNotifications({
      title: payload.title,
      message: payload.message,
      receiver: users,
      isRead: false,
      filePath: payload.filePath,
      referenceId: payload.referenceId,
      is_schedule_notification: payload.is_schedule_notification,
      schedule_time: payload.schedule_time,
      owner: user.id,
      extraPath: payload?.extraPath,
    });
  } catch (error) {
    console.log(error);
  }
};

export const NotificationService = {
  updateNotificationToDB,
  allNotificationFromDB,
  markAllNotificationsAsRead,
  sendPushNotification,
};
