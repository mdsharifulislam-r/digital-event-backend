import { JwtPayload } from 'jsonwebtoken';
import { ActivityModel } from './activity.interface';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import { Activity } from './activity.model';


const getMyAllActivity = async (user:JwtPayload,query:Record<string, any>) => {
    const inital = user.role === USER_ROLES.ORGANIZATION ? {user:user.id}:{};

    const activityQuery = new QueryBuilder(Activity.find(inital), query)
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    const [activities, paginationInfo] = await Promise.all([
        activityQuery.modelQuery.exec(),
        activityQuery.getPaginationInfo()
    ])
    return { activities, paginationInfo };
};


export const ActivityServices = {
    getMyAllActivity
};
