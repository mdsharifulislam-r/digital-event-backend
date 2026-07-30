import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { Event, Favorite } from '../event/event.model';
import { ArtistModel, IArtist } from './artist.interface';
import { Artist } from './artist.model';
import { USER_ROLES } from '../../../enums/user';

const createArtist = async (artistData: IArtist, user: JwtPayload): Promise<IArtist> => {
    const artist = await Artist.create({ ...artistData, orgainzation: user?.id });
    return artist;
};


const getAllArtists = async (query: Record<string, any>, user: JwtPayload) => {
    console.log(user)
    const initQuery = user?.role == USER_ROLES.ORGANIZATION ? { orgainzation: user?.id } : {}
    const artistsQuery = new QueryBuilder<IArtist>(Artist.find(initQuery), query).paginate().sort().filter().search(['name'])
    const [artists, paginationInfo] = await Promise.all([
        artistsQuery.modelQuery.exec(),
        artistsQuery.getPaginationInfo(),
    ]);
    return { artists, paginationInfo };

}


const singleArtist = async (artistId: string) => {
    const artist = await Artist.findById(artistId);
    return artist;
}



const getEventsUsingArtistId = async (artistId: string, query: Record<string, any>, user: any) => {
    console.log(artistId, query);
    let initQuery = { artist: artistId } as Record<string, any>;
    const eventQuery = new QueryBuilder(Event.find(initQuery, {
        address: 1,
        title: 1,
        category: 1,
        cover_image: 1,
        price: 1,
        event_date: 1,
        interest_count: 1,
    }), query)
        .search(['title', 'category', 'description_html'])
        .filter(['startDate', 'endDate'])
        .sort()
        .paginate();
    let [events, paginationInfo] = await Promise.all([
        eventQuery.modelQuery.exec(),
        eventQuery.getPaginationInfo(),
    ]);

    events = await Promise.all(events.map(async (event) => {
        const someInterestPeopsle = await Favorite.find({ item: event._id, type: "Event", user: { $ne: user?.id } }).limit(3).populate('user', 'name image').lean();
        if (!user) {
            return {
                ...event.toObject(),
                isFavorited: false,
                someInterestPeopsle: someInterestPeopsle.map(fav => fav.user) || []
            }
        }
        const isFavorited = await Favorite.countDocuments({ item: event._id, user: user?.id, type: "Event" }).lean() > 0;
        return {
            ...event.toObject(),
            isFavorited,
            someInterestPeopsle: someInterestPeopsle.map(fav => fav.user) || []
        }
    })) as any[];
    return { events, paginationInfo };
}


const updateArtist = async (id: string, payload: Partial<IArtist>): Promise<IArtist | null> => {
    const updatedArtist = await Artist.findByIdAndUpdate(id, payload, { new: true });
    return updatedArtist;
}

const deleteArtist = async (id: string): Promise<IArtist | null> => {
    const deletedArtist = await Artist.findByIdAndDelete(id);
    return deletedArtist;
}


export const ArtistServices = {
    createArtist,
    getAllArtists,
    getEventsUsingArtistId,
    singleArtist,
    updateArtist,
    deleteArtist
};
