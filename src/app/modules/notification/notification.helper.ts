
import { JwtPayload } from "jsonwebtoken";
import { Booking } from "../booking/booking.model";
import { Event, Favorite } from "../event/event.model";
import { Programmes } from "../programmes/programmes.model";
import { Venue } from "../vanue/vanue.model";
import { ISendNotification } from "./notification.interface";

const gotUsersForNotification = async (payload: ISendNotification, user: string): Promise<any[]> => {
    if (payload.target === 'all_proggame_holders') {
        const porrgrams = await Programmes.find({ owner: user }).distinct('_id');
        const bookings = await Booking.find({ programme: { $in: porrgrams }, status: 'confirmed' }).distinct('user');

        return bookings;
    }

    if (payload.target === 'specific_event') {
        const event = await Event.findById(payload.event);
        if (!event) {
            return [];
        }

        const bookings = (await Booking.find({ programme: event.programme, status: 'confirmed' }).distinct('user')).map(user => user.toString());
        const fevorite = (await Favorite.find({ item: event._id, type: 'Event' }).distinct('user')).map(user => user.toString());
        const users = [...new Set([...bookings, ...fevorite])];
        return users;
    }

    if (payload.target === 'specific_vanue') {
        const vanue = await Venue.findById(payload.vanue);
        if (!vanue) {
            return [];
        }

        const events = await Event.find({ vanue: vanue._id }).distinct('_id');
        const bookings = (await Booking.find({ event: { $in: events }, status: 'confirmed' }).distinct('user')).map(user => user.toString());
        const fevorite = (await Favorite.find({ item: { $in: events }, type: 'Event' }).distinct('user')).map(user => user.toString());
        const users = [...new Set([...bookings, ...fevorite])];
        return users;
    }

    if (payload.target == "specific_performance") {
        if (payload.is_only_proggram_holder) {
            const bookings = (await Booking.find({ event: payload.event! }).distinct('user'))
            const fevorite = await Favorite.find({ item: payload.performance, type: 'Performances', _id: { $in: bookings } }).distinct('user');
            return fevorite;
        }
        const fevorite = await Favorite.find({ item: payload.performance, type: 'Performances' }).distinct('user');
        return fevorite;
    }

    if (payload.target == "specific_programme") {
        const bookings = await Booking.find({ programme: payload.proggramme, status: 'confirmed' }).distinct('user');
        return bookings;
    }

    return [];
}


const sendPushNotification = async (
    payload: ISendNotification,
    user: JwtPayload,
) => {

};


export const NotificationHelper = {
    gotUsersForNotification
}