import { JwtPayload } from 'jsonwebtoken';
import { IEvent } from './event.interface';
import { Event, Favorite, QrScan } from './event.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { RedisHelper } from '../../../tools/redis/redis.helper';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Programmes } from '../programmes/programmes.model';
import stripe from '../../../config/stripe';
import { Booking } from '../booking/booking.model';
import { Follower, User } from '../user/user.model';
import { sendActivity } from '../../../handlers/activityHelper';
import { ACTIVITY_TYPE } from '../../../enums/activity';
import config from '../../../config';

const createEvent = async (data: Partial<IEvent>) => {
  const event = (await Event.create(data))
  await RedisHelper.keyDelete(`events_all:${data.author}:*`);
  await RedisHelper.keyDelete(`event:${event._id}:*`);
  sendActivity({title:"New Event Created",description:`Created event ${event?.title}`,user:data.author,type:ACTIVITY_TYPE.EVENT})
  return event;
};

const getEventById = async (id: string,userId:string,qrCode?:boolean) => {

  const cache = await RedisHelper.redisGet(`event:${id}:${userId}`,{ qrCode });
  if (cache) {
    return cache;
  }

  let event = await Event.findById(id).populate([
    {
      path: 'author',
      select: 'name email image',
    },
    {
      path: 'vanue',
      select: 'name address_line1',
    },
    {
        path:'nearby_restaurants',
    },
    {
        path:'nearby_hotels',
    },
    {
        path:'nearby_bars',
    },
    {
      path: 'artist',
      select: 'name image type',
    },
    {
      path: 'programme',
      select: 'title cover_image price_pence is_free',
    }
  ]).lean();

  const isFavorited = await Favorite.countDocuments({ item: id, user: userId, type: "Event" }).lean() > 0;
  
  (event as any).isFavorited = isFavorited;

  const someInterestPeopsle = await Favorite.find({ item: id, type: "Event", user: { $ne: userId }}).limit(3).populate('user', 'name image email followers_count _id').lean();
  (event as any).someInterestPeopsle = someInterestPeopsle.map(fav => fav.user) ||[];

  if(qrCode){
    QrScan.recordScan(event?._id as any, (event?.author as any)._id as any);
  }

  const isAlreadyProgrammePurchased = await Booking.countDocuments({ programme: event?.programme, user: userId, event: id, payment_status: "paid",isDeleted:{$ne:true} }).lean() > 0;
  (event as any).is_already_programme_purchased = isAlreadyProgrammePurchased;

  event!.author = {
    name: (event?.author as any)?.name,
    email: (event?.author as any)?.email,
    image: (event?.author as any)?.image,
    followers_count: (event?.author as any).followers_count || 0,
    _id: (event?.author as any)._id,
    following: await Follower.countDocuments({ follower: userId, following: (event?.author as any)._id }).lean() > 0
  } as any

  await RedisHelper.redisSet(`event:${id}:${userId}`, event, { qrCode });
  return event;
};

const updateEvent = async (id: string, data: Partial<IEvent>) => {
  const isExist = await Event.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }
  const updatedEvent = await Event.findByIdAndUpdate(id, data, { new: true });
  if (updatedEvent) {
    await RedisHelper.keyDelete(`events_all:${updatedEvent.author}:*`);
    await RedisHelper.keyDelete(`event:${id}:*`);
  }
  sendActivity({title:"Event Updated",description:`Updated event ${updatedEvent?.title}`,user:updatedEvent?.author,type:ACTIVITY_TYPE.EVENT})
  return updatedEvent;
};

const deleteEvent = async (id: string) => {
  const deletedEvent = await Event.findByIdAndDelete(id);
  if (deletedEvent) {
    await RedisHelper.keyDelete(`events_all:${deletedEvent.author}:*`);
  }
  await RedisHelper.keyDelete(`event:${id}:*`);
  sendActivity({title:"Event Deleted",description:`Deleted event ${deletedEvent?.title}`,user:deletedEvent?.author,type:ACTIVITY_TYPE.EVENT})
  return deletedEvent;
};

const getAllEvents = async (query: Record<string, any>, user: JwtPayload) => {
  const cache = await RedisHelper.redisGet(`events_all:${user.id}`, query);
  if (cache) {
    return cache;
  }

  const eventQuery = new QueryBuilder(Event.find({ author: user.id }), query)
    .search(['title', 'category', 'description_html'])
    .filter()
    .sort()
    .paginate()

  const [events, paginationInfo] = await Promise.all([
    eventQuery.modelQuery.populate([{
      path:"vanue" ,
      select: 'name address_line1'
    },
    {
      path:"programme",
      select: 'title cover_image price_pence'
    }
  
  ]).exec(),
    eventQuery.getPaginationInfo(),
  ]);

  await RedisHelper.redisSet(`events_all:${user.id}`, { events, paginationInfo }, query);
  return { events, paginationInfo };
};


const searchEvents = async (query: Record<string, any>,user:JwtPayload) => {
    let initQuery = {} as Record<string, any>;
    if(query.startDate && query.endDate){
        initQuery = {
            'event_date': {
                $gte: new Date(query.startDate),
                $lte: new Date(query.endDate)
            }
        };
    }
    if(query.category){
        query.category = query.category[0].toUpperCase() + query.category.slice(1);
    }
    const eventQuery = new QueryBuilder(Event.find(initQuery,{
        address: 1,
        title: 1,
        category: 1,
        cover_image: 1,
        price: 1,
        event_date: 1,
        interest_count: 1,
        programme: 1,
        description_html: 1
    }), query)
    .search(['title', 'category', 'description_html'])
    .filter(['startDate', 'endDate'])
    .sort()
    .paginate();
    let [events, paginationInfo] = await Promise.all([
        eventQuery.modelQuery.populate('programme', 'title cover_image price_pence').exec(),
        eventQuery.getPaginationInfo(),
    ]);

    events = await Promise.all(events.map(async (event) => {
        const isFavorited = await Favorite.countDocuments({ item: event._id, user: user?.id, type: "Event" }).lean() > 0;
        const someInterestPeopsle = await Favorite.find({ item: event._id, type: "Event", user: { $ne: user?.id } }).limit(3).populate('user', 'name image').lean();
        return {
            ...event.toObject(),
            isFavorited,
            someInterestPeopsle : someInterestPeopsle.map(fav => fav.user) ||[]
        }
    })) as any[];
    return { events, paginationInfo };
}


const makeFavorite = async (itemId: string, userId: string, type: "Event" | "Recommendations"|'Venue'|'Performances') => {
  const result = await Favorite.toggleFavorite(new Types.ObjectId(itemId), new Types.ObjectId(userId), type);
  return result;
}


const purchaseProggramme = async (eventId: string, userId: string) => {
    const event = await Event.findById(eventId);
    if(!event){
        throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
    }


    const programme = await Programmes.findById(event.programme);
    if(!programme){
        throw new ApiError(StatusCodes.NOT_FOUND, "Programme not found for this event");
    }

    const booking = await Booking.findOne({programme: programme._id, user: userId, event: eventId,payment_status:"paid",isDeleted:{$ne:true}});
    if(booking){
        throw new ApiError(StatusCodes.BAD_REQUEST, "You have already purchased this programme");
    }

    if(programme.price_pence <= 0 && programme.is_free){
        const newBooking = await Booking.create({
            programme: programme._id,
            user: userId,
            event: eventId,
            status: "confirmed",
            booking_date: new Date(),
            payment_status: "paid",
            price: 0,
            organization: event.author,
        })
        return { message: "Programme purchased successfully" };
    }

    const newBooking = await Booking.create({
        programme: programme._id,
        user: userId,
        event: eventId,
        status: "pending",
        booking_date: new Date(),
        payment_status: "unpaid",
        price: event.price,
        organization: event.author,
    })
    

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'gbp',
                product_data: {
                    name: `Programme for ${event.title}`,
                    description:`${programme.title} for ${event.title}`,
                },
                unit_amount: programme.price_pence, // Convert to cents
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${config.urls.frontend}/payment/success?type=programme`,
        cancel_url: `${config.urls.frontend}/payment/cancelled?type=programme`,
        metadata: {
            bookingId: newBooking._id.toString()
        },
        customer_email: (await User.findById(userId))?.email
    });

    return session.url;

}


const getAllFavorites = async (user:JwtPayload,query:Record<string, any>) => {
  const favoriteQuery = new QueryBuilder(Favorite.find({ user: user.id }), query).paginate().sort().filter()
  let [favorites, paginationInfo] = await Promise.all([
      favoriteQuery.modelQuery.populate('item').exec(),
      favoriteQuery.getPaginationInfo(),
  ])

  favorites = await Promise.all(favorites.map(async favorite => {
      return favorite.item;
  })) as any[]

  return { favorites, paginationInfo };
}


export const EventServices = {
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
  searchEvents,
  makeFavorite,
  purchaseProggramme,
  getAllFavorites
};
