import { JwtPayload } from 'jsonwebtoken';
import { IVenue } from './vanue.interface';
import { Venue } from './vanue.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { sendActivity } from '../../../handlers/activityHelper';
import { ACTIVITY_TYPE } from '../../../enums/activity';

const createVanue = async (payload: IVenue): Promise<IVenue> => {
    payload.location = {
        type: 'Point',
        coordinates: [payload.coordinates?.longitude || 0, payload.coordinates?.latitude || 0]
    }
    const createdVanue = await Venue.create(payload);
    sendActivity({title:"New Vanue Added",description:`Created vanue ${createdVanue?.name}`,user:createdVanue?.owner,type:ACTIVITY_TYPE.VENUE})
    return createdVanue;
}

const getVanueById = async (id: string): Promise<IVenue | null> => {
    const vanue = await Venue.findById(id);
    return vanue;
}

const updateVanue = async (id: string, payload: Partial<IVenue>): Promise<IVenue | null> => {
    const updatedVanue = await Venue.findByIdAndUpdate(id, payload, { new: true });
    return updatedVanue;
}

const deleteVanue = async (id: string): Promise<IVenue | null> => {
    const deletedVanue = await Venue.findByIdAndDelete(id);
    return deletedVanue;
}

const getMyAllVanue = async (user:JwtPayload,query:Record<string, any>) => {
    const vanueQuery = new QueryBuilder(Venue.find({ owner: user.id }), query)
    .search(['name', 'description'])
    .filter()
    .sort()
    .paginate()
    const [vanues, paginationInfo] = await Promise.all([
        vanueQuery.modelQuery.exec(),
        vanueQuery.getPaginationInfo()
    ])
    return { vanues, paginationInfo };

}

export const VanueServices = { createVanue, getVanueById, updateVanue, deleteVanue, getMyAllVanue };