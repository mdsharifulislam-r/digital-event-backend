import { JwtPayload } from 'jsonwebtoken';
import { AdModel, IAd } from './ad.interface';
import { ACTIVITY_TYPE } from '../../../enums/activity';
import { sendActivity } from '../../../handlers/activityHelper';
import { Ad } from './ad.model';
import { sendNotificationQueue } from '../../../helpers/notificationHelper';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';
import { kafkaProducer } from '../../../tools/kafka/kafka-producers/kafka.producer';
import { Types } from 'mongoose';

const createAdToDB = async (adData: IAd, user: JwtPayload) => {
  const ad = await Ad.create({
    ...adData,
    user: user.id,
  });
  const userInfo = await User.findById(user.id, { name: 1 });
  if (!userInfo) {
    throw new ApiError(404, 'User not found');
  }
  await Promise.all([
    sendActivity({
      title: 'New Ad Added',
      description: `${userInfo?.name} published a new ad`,
      user: user.id,
      type: ACTIVITY_TYPE.AD,
    }),
    sendNotificationQueue({
      title: 'New Ad Added',
      message: `You have a new ad added to your subscription`,
      receiver: [user.id],
      isRead: false,
      filePath: 'general',
      referenceId: ad._id,
    }),
    sendNotificationQueue({
      title: 'New Ad Added',
      message: `${userInfo?.name} published a new ad`,
      isRead: false,
      filePath: 'general',
      referenceId: ad._id,
    }),
  ]);
  return ad;
};


const getAllAdsFromDB = async (user:JwtPayload,query:Record<string, any>) => {
    const inital = ![USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN].includes(user.role) ? {user:user.id,status:'active'}:{status:'active'};
    const adQuery = new QueryBuilder(Ad.find(inital), query)
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    const [ads, pagination] = await Promise.all([
        adQuery.modelQuery.exec(),
        adQuery.getPaginationInfo()
    ])
    return { ads, pagination };
};


const getSingleAdFromDB = async (id: string,user:JwtPayload) => {
    const ad = await Ad.findOne({ _id: id,status:'active' }).populate('user', 'name email image');
    if (!ad) {
        throw new ApiError(404, 'Ad not found');
    }

    await kafkaProducer.sendMessage("ad",{
        type:"click",
        data:{ad_id:id,user_id:user.id}
    })

    return ad;
};

const deleteAdFromDB = async (id: string) => {
    const ad = await Ad.findOne({ _id: id,status:'active' });
    if (!ad) {
        throw new ApiError(404, 'Ad not found');
    }
    await Ad.updateOne({ _id: id }, { status: 'delete' });
    return ad;
};

const updateAdToDB = async (id: string, payload: Partial<IAd>) => {
    const ad = await Ad.findOne({ _id: id,status:'active' });
    if (!ad) {
        throw new ApiError(404, 'Ad not found');
    }
    await Ad.updateOne({ _id: id }, payload);
    return ad;
};

const getBulkAdsFromDB = async (ids: string[],) => {
    const filter: Record<string, any> = {
        _id: { $in: ids },
        status: 'active',
    };

    return Ad.find(filter)
};

const getAnalaytics = async (user:JwtPayload) => {
    const adsAnalytics = await Ad.aggregate([
        {
            $match: {
                user: new Types.ObjectId(user.id),
            }
        },
        {
            $group: {
                _id: null,
                totalImpressions: { $sum: '$impressions' },
                totalClicks: { $sum: '$clicks' },
                totalViews: { $sum: '$views' },
                totalRevenue: { $sum: '$revenue' }
            }
        }
    ]);

    const activeAdsCount = await Ad.countDocuments({ user: new Types.ObjectId(user.id), status: 'active' });

    return adsAnalytics[0]?{
        totalImpressions: adsAnalytics[0].totalImpressions,
        totalClicks: adsAnalytics[0].totalClicks,
        totalViews: adsAnalytics[0].totalViews,
        totalRevenue: adsAnalytics[0].totalRevenue,
        activeAdsCount: activeAdsCount
    }: {
        totalImpressions: 0,
        totalClicks: 0,
        totalViews: 0,
        totalRevenue: 0,
        activeAdsCount: activeAdsCount
    };
}

export const AdServices = {
    createAdToDB,
    getAllAdsFromDB,
    getSingleAdFromDB,
    deleteAdFromDB,
    updateAdToDB,
    getBulkAdsFromDB,
    getAnalaytics
};
