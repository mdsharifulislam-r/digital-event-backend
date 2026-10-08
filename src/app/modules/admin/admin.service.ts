import { StatusCodes } from 'http-status-codes';

import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';

import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';
import config from '../../../config';
import bcrypt from 'bcrypt';
const createAdminToDB = async (payload: IUser): Promise<IUser> => {
    const createAdmin= await User.create({
        ...payload,
        role: payload.role || 'ADMIN',
        verified: true
    });
    
    if (!createAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Admin');
    }

    return createAdmin;
};

const deleteAdminFromDB = async (id: any): Promise<IUser | undefined> => {
    const isExistAdmin = await User.findOneAndDelete({ _id: id, });
    if (!isExistAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete Admin');
    }
    return;
};

const getAdminFromDB = async (query:Record<string,any>)=> {
    const result = new QueryBuilder(User.find({verified:true,status:'active',role:{$in:[USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN]}}),query).paginate().sort().filter().search(['name','email'])
    const paginationInfo = await result.getPaginationInfo()
    const resultData = await result.modelQuery.lean()
    return {
        paginationInfo,
        resultData
    }
}

const getAdminByIdFromDB = async (id: any): Promise<IUser | undefined> => {
    const isExistAdmin = await User.findOne({ _id: id, });
    if (!isExistAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found');
    }
    return isExistAdmin;
};

const updateAdminToDB = async (id: any, payload: Partial<IUser>): Promise<IUser | undefined> => {
    if(payload?.password){
        payload.password = await bcrypt.hash(
            payload.password,
            Number(config.bcrypt_salt_rounds)
          );
    }
    const isExistAdmin = await User.findOneAndUpdate({ _id: id, }, payload, { new: true });
    if (!isExistAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update Admin');
    }
    
    return isExistAdmin;
};

export const AdminService = {
    createAdminToDB,
    deleteAdminFromDB,
    getAdminFromDB,
    getAdminByIdFromDB,
    updateAdminToDB
};
