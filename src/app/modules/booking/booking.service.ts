import { JwtPayload } from 'jsonwebtoken';
import { BookingModel } from './booking.interface';
import { Booking } from './booking.model';
import QueryBuilder from '../../builder/QueryBuilder';
const getMyAllProgrammes = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const programmesQuery = new QueryBuilder(
    Booking.find(
      { user: user.id, payment_status: 'paid', status: 'confirmed' },
      { programme: 1 },
    ),
    query,
  )
    .search(['title'])
    .filter()
    .sort()
    .paginate();
  let [programmes, paginationInfo] = await Promise.all([
    programmesQuery.modelQuery.populate('programme','title cover_image').exec(),
    programmesQuery.getPaginationInfo(),
  ]);

  programmes = (await Promise.all(
    programmes.map(async programme => {
      return programme.programme;
    }),
  )) as any;

  return { programmes, paginationInfo };
};
export const BookingServices = {
  getMyAllProgrammes,
};
