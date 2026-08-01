import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { IProgrammes, IProgrammesAnalytics, ProgrammesModel } from './programmes.interface';
import { Programmes } from './programmes.model';
import { RedisHelper } from '../../../tools/redis/redis.helper';
import { Booking } from '../booking/booking.model';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { sendActivity } from '../../../handlers/activityHelper';
import { ACTIVITY_TYPE } from '../../../enums/activity';
import { kafkaProducer } from '../../../tools/kafka/kafka-producers/kafka.producer';
import { Types } from 'mongoose';
import { Click } from '../ad/ad.model';
import { getDateRange } from '../../../helpers/dateTimeHelper';
import { Event } from '../event/event.model';

const createProgrammes = async (payload: IProgrammes): Promise<IProgrammes> => {
  const createdProgrammes = await Programmes.create(payload);
  
  await RedisHelper.redisSet(
    `programmes:${createdProgrammes._id}`,
    createdProgrammes,
  );
  await RedisHelper.keyDelete(`programmes_all:*`); // Invalidate the cache for all programmes


  if(createdProgrammes.status=="published"){
    sendActivity({title:"New Programme Created",description:`Created programme ${createdProgrammes?.title}`,user:createdProgrammes?.owner,type:ACTIVITY_TYPE.PROGRAMME})
  }
  return createdProgrammes;
};

const getProgrammesById = async (
  id: string,
  user: JwtPayload,
): Promise<IProgrammes | null> => {
  // const cache = await RedisHelper.redisGet(`programmes:${id}:${user.id}`);
  // if (cache) {
  //   return cache;
  // }
  const programmes = await Programmes.findById(id);

  if (
    user.role == USER_ROLES.ORGANIZATION &&
    programmes?.owner.toString() != user.id
  ) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'You are not authorized to access this resource.',
    );
  }
  if (user.role == USER_ROLES.USER) {
    const booking = await Booking.findOne({
      programme: id,
      user: user.id,
      payment_status: 'paid',
      status: 'confirmed',
    });
    if (!booking) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to access this resource.',
      );
    }
  }
  if (programmes) {
    // await RedisHelper.redisSet(`programmes:${id}:${user.id}`, programmes);
  }
  await kafkaProducer.sendMessage("ad",{
    type: "programmes-click",
    data: {
      programmeId: id,
      userId: user.id
    }
  })
  return programmes;
};

const updateProgrammes = async (
  id: string,
  payload: Partial<IProgrammes>,
): Promise<IProgrammes | null> => {

  if(!payload.category && payload.status=="published"){
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Category is required.');
  }
  const updatedProgrammes = await Programmes.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (updatedProgrammes) {
    await RedisHelper.redisSet(`programmes:${id}`, updatedProgrammes);
  }
  return updatedProgrammes;
};

const deleteProgrammes = async (id: string): Promise<IProgrammes | null> => {
  const deletedProgrammes = await Programmes.findByIdAndDelete(id);
  if (deletedProgrammes) {
    await RedisHelper.keyDelete(`programmes:${id}:*`); // Invalidate the cache for this programme
    await RedisHelper.keyDelete(`programmes_all:*`); // Invalidate the cache for all programmes
  }
  return deletedProgrammes;
};

const getAllProgrammes = async (
  query: Record<string, any>,
  user: JwtPayload,
) => {
  const cache = await RedisHelper.redisGet(`programmes_all`, query);
  if (cache) {
    return cache;
  }
  let initQuery = { owner: user.id } as Record<string, any>;
  if (query?.venue_id || query?.event_id) {
    initQuery = {};
  }
  const programmesQuery = new QueryBuilder<IProgrammes>(
    Programmes.find(initQuery),
    query,
  )
    .search(['title'])
    .filter()
    .sort();

  const [programmes, paginationInfo] = await Promise.all([
    programmesQuery.modelQuery.exec(),
    programmesQuery.getPaginationInfo(),
  ]);
  await RedisHelper.redisSet(
    `programmes_all`,
    { programmes, paginationInfo },
    query,
  );
  return { programmes, paginationInfo };
};


const getAnalyticsForProgrammes = async (user: JwtPayload,query:IProgrammesAnalytics) => {
  const dateRange = getDateRange(query.date_range);
  if(!query?.ids?.length) {
    query.ids = await Programmes.find({owner: new Types.ObjectId(user.id)}).distinct('_id') as any[];
  }

  const clickViewMatchStage = await Click.countDocuments({
    item: { $in: query.ids.map(id => new Types.ObjectId(id)) },
    type: 'Programmes',
    createdAt: {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate,
    }
  });

  const totalSolds = await Booking.countDocuments({
    programme: { $in: query.ids.map(id => new Types.ObjectId(id)) },
    payment_status: 'paid',
    status: 'confirmed',
    createdAt: {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate,
    }
  });

  return {
    ctotalClicks: clickViewMatchStage,
    totalViews: clickViewMatchStage,
    totalSolds
  }

}


const getViewsAndClicksGraphData = async (user: JwtPayload, query: IProgrammesAnalytics) => {
  const dateRange = getDateRange(query.date_range);
  if(!query?.ids?.length) {
    query.ids = await Programmes.find({owner: new Types.ObjectId(user.id)}).distinct('_id') as any[];
  }
  
  // Check if the date range is for a full year
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  const isYearView = query.date_range === 'thisYear' 
  
  let clickViewGraphData: any[] = [];
  
  if (isYearView) {
    // Year view: Group by month
    const aggregationPipeline = [
      {
        $match: {
          item: { $in: query.ids.map(id => new Types.ObjectId(id)) },
          type: 'Programmes',
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          }
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
  } else {
    // Other ranges: Group by date and show day of week
    const aggregationPipeline = [
      {
        $match: {
          item: { $in: query.ids.map(id => new Types.ObjectId(id)) },
          type: 'Programmes',
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          clicks: { $sum: 1 },
          views: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          day: "$_id.day",
          month: "$_id.month",
          year: "$_id.year",
          clicks: 1,
          views: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ];
    
    const dateData = await Click.aggregate(aggregationPipeline as any);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Generate all dates in range
    const allDates: Record<string, any> = {};
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      allDates[dateKey] = {
        date: new Date(currentDate),
        dayOfWeek,
        label: dayNames[dayOfWeek],
        clicks: 0,
        views: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Fill in actual data
    dateData.forEach(item => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (allDates[dateKey]) {
        allDates[dateKey].clicks = item.clicks;
        allDates[dateKey].views = item.views;
      }
    });
    
    // Convert to array and sort
    clickViewGraphData = Object.values(allDates).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ).map((item: any) => ({
      date: item.date,
      dayOfWeek: item.dayOfWeek,
      label: item.label,
      clicks: item.clicks,
      views: item.views
    }));
  }
  
  return clickViewGraphData;
}


const getRevenueGraphData = async (user: JwtPayload, query: IProgrammesAnalytics) => {
  const dateRange = getDateRange(query.date_range);
  if(!query?.ids?.length) {
    query.ids = await Programmes.find({owner: new Types.ObjectId(user.id)}).distinct('_id') as any[];
  }
  
  // Check if the date range is for a full year
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  const isYearView = query.date_range === 'thisYear'
  
  let revenueGraphData: any[] = [];
  
  if (isYearView) {
    // Year view: Group by month
    const aggregationPipeline = [
      {
        $match: {
          programme: { $in: query.ids.map(id => new Types.ObjectId(id)) },
          payment_status: 'paid',
          status: 'confirmed',
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          }
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
  } else {
    // Other ranges: Group by date and show day of week
    const aggregationPipeline = [
      {
        $match: {
          programme: { $in: query.ids.map(id => new Types.ObjectId(id)) },
          payment_status: 'paid',
          status: 'confirmed',
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          revenue: { $sum: "$total_price" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          day: "$_id.day",
          month: "$_id.month",
          year: "$_id.year",
          revenue: 1,
          count: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ];
    
    const dateData = await Booking.aggregate(aggregationPipeline as any);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Generate all dates in range
    const allDates: Record<string, any> = {};
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      allDates[dateKey] = {
        date: new Date(currentDate),
        dayOfWeek,
        label: dayNames[dayOfWeek],
        revenue: 0,
        count: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Fill in actual data
    dateData.forEach(item => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (allDates[dateKey]) {
        allDates[dateKey].revenue = item.revenue;
        allDates[dateKey].count = item.count;
      }
    });
    
    // Convert to array and sort
    revenueGraphData = Object.values(allDates).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ).map((item: any) => ({
      date: item.date,
      dayOfWeek: item.dayOfWeek,
      label: item.label,
      revenue: item.revenue,
      count: item.count
    }));
  }
  
  return revenueGraphData;
}


const getBookingCountForProgrammes = async (proggramme: Types.ObjectId) => {
  return await Booking.countDocuments({ programme: proggramme, status: 'confirmed' });
};



export const ProgrammesServices = {
  createProgrammes,
  getProgrammesById,
  updateProgrammes,
  deleteProgrammes,
  getAllProgrammes,
  getAnalyticsForProgrammes,
  getViewsAndClicksGraphData,
  getRevenueGraphData,
  getBookingCountForProgrammes
};
