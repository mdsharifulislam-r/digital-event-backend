import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { ISuspendPayload, IUser } from './user.interface';
import { Follower, Organization, User } from './user.model';
import { AuthHelper } from '../auth/auth.helper';
import { Response } from 'express';
import { Types } from 'mongoose';
import { RedisHelper } from '../../../tools/redis/redis.helper';
import QueryBuilder from '../../builder/QueryBuilder';
import { kafkaProducer } from '../../../tools/kafka/kafka-producers/kafka.producer';

const createUserToDB = async (payload: Partial<any>, res: Response) => {
  const isExist = await User.findOne({ email: payload.email });
  if (isExist) {
    if (isExist.status === 'delete')
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You don’t have permission to access this content.It looks like your account has been deactivated.',
      );
    if (!isExist.verified) {
      return await AuthHelper.unverifiedAccountHandle(payload.email!, res);
    }
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }
  if (payload.role === USER_ROLES.ORGANIZATION) {
    payload.organization_name = payload.name;
    payload.verified = true; // Set verified to true for organization users
  }
  if (!payload.role) {
    payload.role = USER_ROLES.USER;
  }
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } },
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.findOne({ _id: id }).populate('subscription', 'name modules is_proggramme_sell minimum_programme_price endDate').lean();
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const followHost = async (user: JwtPayload, hostId: string, eventId: string) => {
  await Follower.followUser(new Types.ObjectId(user.id), new Types.ObjectId(hostId));
  await RedisHelper.keyDelete(`event:${eventId}:${user.id}:*`);
};


const getAllUsers = async (query: Record<string, any>) => {
  const userQuery = new QueryBuilder(User.find({ verified: true, role: { $nin: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } }), query)
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate();
  const [users, paginationInfo] = await Promise.all([
    userQuery.modelQuery.exec(),
    userQuery.getPaginationInfo(),
  ]);
  return { users, paginationInfo };
}

const suspendUser = async (userId: string, payload: ISuspendPayload) => {
  const isExistUser = await User.findOne({ _id: userId });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.isSuspended) {
    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isSuspended: false, suspendedAt: null, suspendedUntil: null, suspendedDays: null, suspendedReason: null, status: 'active' } },
      { new: true },
    );
    return isExistUser;
  }
  const { days, reason } = payload;
  const suspendedUntil = new Date();
  suspendedUntil.setDate(suspendedUntil.getDate() + days);
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $set: { isSuspended: true, suspendedAt: new Date(), suspendedUntil, suspendedDays: days, suspendedReason: reason, status: 'delete' } },
    { new: true },
  );
  return updatedUser;
}


const deleteUserAccount = async (user: JwtPayload, password: string) => {
  const userDetails = await User.findOne({ _id: user.id }).select('+password');
  if (!userDetails) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const match = await User.isMatchPassword(password, userDetails.password!);

  if (!match) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  await User.findByIdAndUpdate(user.id, { status: 'delete' }, { new: true });
  return;
};



export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  followHost,
  suspendUser,
  getAllUsers,
  deleteUserAccount
};
