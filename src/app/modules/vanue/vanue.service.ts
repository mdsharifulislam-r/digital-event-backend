import { JwtPayload } from 'jsonwebtoken';
import { IVenue } from './vanue.interface';
import { Venue } from './vanue.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { sendActivity } from '../../../handlers/activityHelper';
import { ACTIVITY_TYPE } from '../../../enums/activity';
import { USER_ROLES } from '../../../enums/user';
import { Favorite } from '../event/event.model';

const createVanue = async (payload: IVenue): Promise<IVenue> => {
    payload.location = {
        type: 'Point',
        coordinates: [payload.coordinates?.longitude || 0, payload.coordinates?.latitude || 0]
    }
    const createdVanue = await Venue.create(payload);
    sendActivity({ title: "New Vanue Added", description: `Created vanue ${createdVanue?.name}`, user: createdVanue?.owner, type: ACTIVITY_TYPE.VENUE })
    return createdVanue;
}

const getVanueById = async (id: string, user: JwtPayload) => {
    const vanue = await Venue.findById(id).populate('owner', 'name email image contact').lean();
    const isFavorited = await Favorite.countDocuments({ item: id, user: user.id, type: "Venue" }).lean() > 0;

    return {
        ...vanue,
        isFavorited
    };
}

const updateVanue = async (id: string, payload: Partial<IVenue>): Promise<IVenue | null> => {
    const updatedVanue = await Venue.findByIdAndUpdate(id, payload, { new: true });
    return updatedVanue;
}

const deleteVanue = async (id: string): Promise<IVenue | null> => {
    const deletedVanue = await Venue.findByIdAndDelete(id);
    return deletedVanue;
}

const getMyAllVanue = async (user: JwtPayload, query: Record<string, any>) => {
    const initQuery = [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role) ? {} : user.role == USER_ROLES.USER ? { status: 'active' } : { owner: user.id };
    const vanueQuery = new QueryBuilder(Venue.find(initQuery), query)
        .search(['name', 'description'])
        .filter()
        .sort()
        .paginate()
    let [vanues, paginationInfo] = await Promise.all([
        vanueQuery.modelQuery.populate([
            {
                path: "owner",
                select: "name email image contact organization_type",
                populate: {
                    path: 'subscription',
                    select: 'package',
                    populate: {
                        path: 'package',
                        select: 'short',
                    }
                }
            }
        ]).exec(),
        vanueQuery.getPaginationInfo()
    ])

    vanues = await Promise.all(vanues.map(async (vanue: any) => {
        const isFavorited = await Favorite.countDocuments({ item: vanue._id, user: user?.id, type: "Venue" }).lean() > 0;
        return {
            ...vanue.toObject(),
            isFavorited
        }
    }))
    return { vanues, paginationInfo };

}

export const VanueServices = { createVanue, getVanueById, updateVanue, deleteVanue, getMyAllVanue };