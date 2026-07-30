import { generateQRCode } from "../../../helpers/qrCodeHelper";
import { Event } from "./event.model";

const saveQrCode = async (eventId: string) => {
    const eventUrl = `https://showe-web.vercel.app/events/${eventId}?source=qr_code`;
    const qrCodeUrl = await generateQRCode(eventUrl);
    await Event.findByIdAndUpdate(eventId, { qr_code_url: qrCodeUrl });
}


export const EventHelper = {
    saveQrCode,
}