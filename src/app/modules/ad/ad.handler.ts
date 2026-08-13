import { IDwellTime } from "./ad.interface";
import { Ad, Click, DwellTime } from "./ad.model";

const handleClickAndViewOfAd = async (ad_id: string, user_id: string) => {
    // Check if the user has already clicked or viewed the ad in the last 24 hours
    const existingClick = await Click.findOne({
        item: ad_id,
        user: user_id,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24 hours
    });

    if (existingClick) {
        return existingClick;
    }
    // If not, create a new click record
    const newClick = await Click.create({
        item: ad_id,
        user: user_id,
        type:"Ad"
    });

    await Ad.findByIdAndUpdate(ad_id, { $inc: {clicks: 1,views: 1} });

    return newClick;
};


const handleDwellTimeOfAd = async (payload:IDwellTime)=>{
    await DwellTime.create(payload);
}


export const AdHandler = {
    handleClickAndViewOfAd,
    handleDwellTimeOfAd
}