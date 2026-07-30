import { JwtPayload } from 'jsonwebtoken';
import { BookingModel } from './booking.interface';
import { Booking } from './booking.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Programmes } from '../programmes/programmes.model';
const getMyAllProgrammes = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {

  const userAllProgrammes = await Booking.find({ user: user.id, payment_status: 'paid', status: 'confirmed' }).distinct('programme');
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
export const BookingServices = {
  getMyAllProgrammes,
};
