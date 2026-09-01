import { JwtPayload } from 'jsonwebtoken';
import { Booking } from './booking.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Programmes } from '../programmes/programmes.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
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

  

export const BookingServices = {
  getMyAllProgrammes,
  deleteMyProgrammes
};
