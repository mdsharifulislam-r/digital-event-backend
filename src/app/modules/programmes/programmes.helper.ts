import { RedisHelper } from "../../../tools/redis/redis.helper";
import { Click } from "../ad/ad.model"
import { Programmes } from "./programmes.model";

const handleProgrammesClickAndView = async (programmeId: string, userId:string) => {
    const existingClick = await Click.findOne({ item: programmeId, user: userId, type: 'Programmes',createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });

    if (existingClick) {
        return existingClick;
    }
    // If not, create a new click record
    const newClick = await Click.create({ item: programmeId, user: userId, type: 'Programmes' });
    await Programmes.findByIdAndUpdate(programmeId, { $inc: { clicks: 1,views: 1 } });
    await RedisHelper.keyDelete(`programmes:${programmeId}:*`);

    return newClick;
}

export const ProgrammesHelper = {
    handleProgrammesClickAndView
}