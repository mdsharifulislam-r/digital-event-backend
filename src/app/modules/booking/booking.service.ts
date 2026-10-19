import { JwtPayload } from 'jsonwebtoken';
import { Booking } from './booking.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Programmes } from '../programmes/programmes.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Subscription } from '../subscription/subscription.model';
const getMyAllProgrammes = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {

  const userAllProgrammes = await Booking.find({ user: user.id, payment_status: 'paid', status: 'confirmed',isDeleted:{$ne:true} }).distinct('programme');
  const programmesQuery = new QueryBuilder(
    Programmes.find({ _id: { $in: userAllProgrammes } },{title:1,cover_image:1}),
    query,
  )
    .search(['title'])
    .filter()
    .sort()
    .paginate();
  let [programmes, paginationInfo] = await Promise.all([
    programmesQuery.modelQuery.exec(),
    programmesQuery.getPaginationInfo(),
  ]);

  return { programmes, paginationInfo };
};

const deleteMyProgrammes = async (user: JwtPayload, programmeId: string) => {
  const booking = await Booking.findOne({ user: user.id, programme: programmeId, isDeleted: { $ne: true } });
  
  if (!booking) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Programme doesn't exist!");
  }

  if(booking.user.toString() !== user.id){
    throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized to delete this programme!");
  }

  await Booking.updateOne({ _id: booking._id }, { isDeleted: true });
  return { message: 'Programme deleted successfully!' };

}


const getBookingInformationAddressWise = async () => {
  // Booking has `event`, but only Event contains the address.
  // Group by the event so each result contains the event address plus the total booking amount.
  const bookingInformation = await Booking.aggregate([
    {
      $match: {
        payment_status: 'paid',
        status: 'confirmed',
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: '$event',
        totalPrice: { $sum: '$price' },
      },
    },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'event',
      },
    },
    {
      $unwind: {
        path: '$event',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        eventId: '$event._id',
        eventAddress: '$event.address',
        totalPrice: 1,
      },
    },
  ]);

  return bookingInformation;
};


const getWebsiteRavinueInformationAndPercentage = async () => {
  const totalRavenue = await Booking.aggregate([
    {
      $match: {
        payment_status: 'paid',
        status: 'confirmed',
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: null,
        totalRavenue: { $sum: '$price' },
      },
    },
  ])

  const totalSubscriptionRavinue = await Subscription .aggregate([
    {
      $group: {
        _id: null,
        totalRavenue: { $sum: '$price' },
      },
    },
  ])

  const totalRavenueAmount = totalRavenue.length > 0 ? totalRavenue[0].totalRavenue : 0;
  const totalSubscriptionRavenueAmount = totalSubscriptionRavinue.length > 0 ? totalSubscriptionRavinue[0].totalRavenue : 0;
  
  const totalPrice = totalRavenueAmount + totalSubscriptionRavenueAmount;
  const subscriptionPercentange = (totalSubscriptionRavenueAmount / totalPrice) * 100;
  const ravenuePercentange = (totalRavenueAmount / totalPrice) * 100;
  return {
    total : totalPrice,
    subscription:{
      percentange:subscriptionPercentange,
      amount:totalSubscriptionRavenueAmount
    },
    booking:{
      percentange:ravenuePercentange,
      amount:totalRavenueAmount
    }
  }
}
  

export const BookingServices = {
  getMyAllProgrammes,
  deleteMyProgrammes,
  getBookingInformationAddressWise,
  getWebsiteRavinueInformationAndPercentage
};
