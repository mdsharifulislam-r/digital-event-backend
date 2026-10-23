import { JwtPayload } from 'jsonwebtoken';
import { IVenue } from './vanue.interface';
import { Venue } from './vanue.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { sendActivity } from '../../../handlers/activityHelper';
import { ACTIVITY_TYPE } from '../../../enums/activity';
import { USER_ROLES } from '../../../enums/user';
import { Event, Favorite } from '../event/event.model';
import { Types } from 'mongoose';

const createVanue = async (payload: IVenue): Promise<IVenue> => {
    payload.location = {
        type: 'Point',
        coordinates: [payload.coordinates?.longitude || 0, payload.coordinates?.latitude || 0]
    }
    const createdVanue = await Venue.create(payload);
    sendActivity({ title: "New Venue Added", description: `Created venue ${createdVanue?.name}`, user: createdVanue?.owner, type: ACTIVITY_TYPE.VENUE })
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
    const [vanues, paginationInfo] = await Promise.all([
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

    const venueIds = vanues.map((vanue) => vanue._id);
    const [favoriteVenues, venueStats] = venueIds.length
        ? await Promise.all([
            Favorite.find({ item: { $in: venueIds }, user: user.id, type: 'Venue' })
                .select('item')
                .lean(),
            Event.aggregate<{
                _id: Types.ObjectId;
                eventsCount: number;
                programmesCount: number;
                totalBookings: number;
                totalRevenue: number;
            }>([
                {
                    $match: {
                        vanue: { $in: venueIds },
                        status: 'published',
                    },
                },
                {
                    $lookup: {
                        from: 'bookings',
                        let: { eventId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$event', '$$eventId'] },
                                    status: 'confirmed',
                                    isDeleted: { $ne: true },
                                },
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalBookings: { $sum: 1 },
                                    totalRevenue: {
                                        $sum: {
                                            $cond: [
                                                { $eq: ['$payment_status', 'paid'] },
                                                '$price',
                                                0,
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                        as: 'bookingStats',
                    },
                },
                {
                    $addFields: {
                        totalBookings: {
                            $ifNull: [{ $arrayElemAt: ['$bookingStats.totalBookings', 0] }, 0],
                        },
                        totalRevenue: {
                            $ifNull: [{ $arrayElemAt: ['$bookingStats.totalRevenue', 0] }, 0],
                        },
                    },
                },
                {
                    $group: {
                        _id: '$vanue',
                        eventsCount: { $sum: 1 },
                        programmesCount: {
                            $sum: {
                                $cond: [{ $ifNull: ['$programme', false] }, 1, 0],
                            },
                        },
                        totalBookings: { $sum: '$totalBookings' },
                        totalRevenue: { $sum: '$totalRevenue' },
                    },
                },
            ]),
        ])
        : [[], []];

    const favoriteVenueIds = new Set(favoriteVenues.map((favorite) => favorite.item.toString()));
    const statsByVenueId = new Map(venueStats.map((stats) => [stats._id.toString(), stats]));
    const venuesWithStats = vanues.map((vanue) => {
        const stats = statsByVenueId.get(vanue._id.toString());
        return {
            ...vanue.toObject(),
            isFavorited: favoriteVenueIds.has(vanue._id.toString()),
            events_count: stats?.eventsCount ?? 0,
            programmes_count: stats?.programmesCount ?? 0,
            total_downloads: stats?.totalBookings ?? 0,
            total_revenue: stats?.totalRevenue ?? 0,
        };
    });
    return { vanues: venuesWithStats, paginationInfo };

}

export const VanueServices = { createVanue, getVanueById, updateVanue, deleteVanue, getMyAllVanue };