import { JwtPayload } from "jsonwebtoken";
import { Booking } from "../booking/booking.model";
import { Types } from "mongoose";
import { Event } from "../event/event.model";
import { Programmes } from "../programmes/programmes.model";
import { Click } from "../ad/ad.model";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";
import { getDateRange } from "../../../helpers/dateTimeHelper";
import { Subscription } from "../subscription/subscription.model";
import { Transaction } from "../transaction/transaction.model";
import { Venue } from "../vanue/vanue.model";



const getOrganizationStatsData = async (user: JwtPayload)=> {
    const [total_downloads,total_revenue,total_events] = await Promise.all([
        Booking.countDocuments({ organization: user.id }),
        Booking.aggregate([
            { $match: { organization:new Types.ObjectId(user.id) } },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ]),

        Event.countDocuments({ author: user.id })

    ])

    return {
        total_downloads,
        total_revenue: total_revenue.length > 0 ? total_revenue[0].total : 0,
        total_events
    }
}

const getViewsAndClicksGraphData = async (user: JwtPayload) => {
  let clickViewGraphData: any[] = [];
  const ids = await Programmes.find({ owner: user.id }).distinct('_id');
    // Year view: Group by month
    const aggregationPipeline = [
      {
        $match: {
          item: { $in: ids.map(id => new Types.ObjectId(id)) },
          type: 'Programmes',
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" }
          },
          clicks: { $sum: 1 },
          views: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ];
    
    const monthData = await Click.aggregate(aggregationPipeline as any);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Create array with all 12 months, fill missing with 0
    for (let i = 1; i <= 12; i++) {
      const foundMonth = monthData.find(m => m._id.month === i);
      clickViewGraphData.push({
        month: i,
        label: monthNames[i - 1],
        clicks: foundMonth?.clicks || 0,
        views: foundMonth?.views || 0
      });
    }
  
  
  return clickViewGraphData;
}


const getRevenueGraphData = async (user: JwtPayload) => {

  
  let revenueGraphData: any[] = [];
  

    // Year view: Group by month
    const aggregationPipeline = [
      {
        $match: {
          organization: new Types.ObjectId(user.id),
          payment_status: 'paid',
          status: 'confirmed',
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$price" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ];
    
    const monthData = await Booking.aggregate(aggregationPipeline as any);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Create array with all 12 months, fill missing with 0
    for (let i = 1; i <= 12; i++) {
      const foundMonth = monthData.find(m => m._id.month === i);
      revenueGraphData.push({
        month: i,
        label: monthNames[i - 1],
        revenue: foundMonth?.revenue || 0,
        count: foundMonth?.count || 0
      });
    }
  
  return revenueGraphData;
}

const getAdminAnalyticsStats = async () => {
    const [active_user,total_views,proggrammes_solds] = await Promise.all([
        User.countDocuments({ status: 'active',role:{$in:[USER_ROLES.USER,USER_ROLES.ORGANIZATION]} }),
        Click.countDocuments({ type: 'Programmes' }),
        Booking.countDocuments({ payment_status: 'paid', status: 'confirmed' })
    ])

    const totalEvents = await Event.countDocuments({ status: 'published' });

    const avgDownloadPerEvent = totalEvents > 0 ? (proggrammes_solds / totalEvents) : 0;

    return {
        active_user,
        total_views,
        proggrammes_solds,
        avg_download_per_event: Number(avgDownloadPerEvent.toFixed(2))
    }
}

const getViewsAndClicksGraphDataForAdmin = async () => {
  let clickViewGraphData: any[] = [];
  const {startDate,endDate} = getDateRange('last7Days')

    // Year view: Group by month
    const aggregationPipeline = [
      {
        $match: {
          type: 'Programmes',
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" }
          },
          clicks: { $sum: 1 },
          views: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ];
    
    const monthData = await Click.aggregate(aggregationPipeline as any);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Create array with all 12 months, fill missing with 0
    for (let i = 1; i <= 12; i++) {
      const foundMonth = monthData.find(m => m._id.month === i);
      clickViewGraphData.push({
        month: i,
        label: monthNames[i - 1],
        clicks: foundMonth?.clicks || 0,
        views: foundMonth?.views || 0
      });
    }
  
  
  return clickViewGraphData;
}


const getAdminDashboardStats = async () => {
    const totalSubscriptionsRavenue = await Subscription.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$price" }
            }
        }
    ])

    const total_commission = await Transaction.aggregate([
        {
            $match: {
                status: 'COMPLETED'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$platform_charge" }
            }
        }
    ])

    console.log(total_commission);
    console.log(totalSubscriptionsRavenue);

    const totalRevenue = totalSubscriptionsRavenue.length  && totalSubscriptionsRavenue[0]?.total ? totalSubscriptionsRavenue[0]?.total||0 + total_commission[0]?.total||0 : 0;
    const totalVanues = await Venue.countDocuments({status: 'active'});
    const totalActiveUsers = await User.countDocuments({status: 'active',role:{$in:[USER_ROLES.USER,USER_ROLES.ORGANIZATION]}});

    return {
        totalRevenue,
        totalVanues,
        totalActiveUsers,
        totalCommission: total_commission.length && total_commission[0]?.total ? total_commission[0]?.total : 0
    }

}

const getRevenueGraphDataForAdmin = async () => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();

  const [subscriptionData, transactionData] = await Promise.all([
    Subscription.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31, 23, 59, 59, 999),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          revenue: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ] as any),
    Transaction.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31, 23, 59, 59, 999),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          revenue: { $sum: "$platform_charge" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ] as any),
  ]);

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const subscriptionMonthData = subscriptionData.find((item: any) => item._id.month === month);
    const transactionMonthData = transactionData.find((item: any) => item._id.month === month);

    return {
      month,
      label: monthNames[index],
      revenue: (subscriptionMonthData?.revenue || 0) + (transactionMonthData?.revenue || 0),
      count: (subscriptionMonthData?.count || 0) + (transactionMonthData?.count || 0),
    };
  });
};



const getSubscriptionCountAndPercentage = async () => {
    const allPackageSubscriptions = await Subscription.aggregate([
        {
            $match: {
                status: 'active',
            },
        },
        {
            $group: {
                _id: '$package',
                count: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: 'packages',
                localField: '_id',
                foreignField: '_id',
                as: 'package',
                pipeline: [
                    {
                        $project: {
                            short: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                _id: 0,
                package: { $arrayElemAt: ["$package", 0] },
                count: 1,
            },
        },
    ]);

    const totalCount = allPackageSubscriptions.reduce(
        (sum: number, item: any) => sum + (item.count || 0),
        0,
    );

    return allPackageSubscriptions.map((item: any) => ({
        package: item.package,
        count: item.count,
        percentage: totalCount > 0 ? Number(((item.count / totalCount) * 100).toFixed(2)) : 0,
    }));
};






export const DashboardServices = {
    getOrganizationStatsData,
    getViewsAndClicksGraphData,
    getRevenueGraphData,
    getAdminAnalyticsStats,
    getViewsAndClicksGraphDataForAdmin,
    getRevenueGraphDataForAdmin,
    getSubscriptionCountAndPercentage,
    getAdminDashboardStats,
    
};
