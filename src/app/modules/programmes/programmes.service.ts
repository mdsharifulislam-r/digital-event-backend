import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { IProgrammes, ProgrammesModel } from './programmes.interface';
import { Programmes } from './programmes.model';
import { RedisHelper } from '../../../tools/redis/redis.helper';
import { Booking } from '../booking/booking.model';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { sendActivity } from '../../../handlers/activityHelper';
import { ACTIVITY_TYPE } from '../../../enums/activity';

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
  const cache = await RedisHelper.redisGet(`programmes:${id}:${user.id}`);
  if (cache) {
    return cache;
  }
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
    await RedisHelper.redisSet(`programmes:${id}:${user.id}`, programmes);
  }
  return programmes;
};

const updateProgrammes = async (
  id: string,
  payload: Partial<IProgrammes>,
): Promise<IProgrammes | null> => {
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



export const ProgrammesServices = {
  createProgrammes,
  getProgrammesById,
  updateProgrammes,
  deleteProgrammes,
  getAllProgrammes,
};
