
import ApiError from "../../../errors/ApiError";
import { RedisHelper } from "../../../tools/redis/redis.helper";
import { IDisclaimer } from "./disclaimer.interface";
import { Disclaimer } from "./disclaimer.model";
import { StatusCodes } from "http-status-codes";

const createDisclaimerToDB = async (payload: Partial<IDisclaimer>) => {
    const createDisclaimer = await Disclaimer.findOne({type:payload.type});

    if (createDisclaimer) {
       const data = await Disclaimer.findOneAndUpdate({type:payload.type},{content:payload.content},{new:true});
       await RedisHelper.keyDelete(`disclaimer:${payload.type}:*`);
       return data;
    }
    await RedisHelper.keyDelete(`disclaimer:${payload.type}:*`);
    return await Disclaimer.create(payload)
}

// I always get pain when I choose someting
const getDisclaimerToDB = async (type:string) => {
    const cache = await RedisHelper.redisGet(`disclaimer:${type}`,{});
    if (cache) {
        console.log('from cache');
        return cache;
    }
    const disclaimer = await Disclaimer.findOne({type},{content:1}).exec();
    if (!disclaimer) {
        return ""
    }

    await RedisHelper.redisSet(`disclaimer:${type}`, disclaimer.content, {}, 60 * 60 * 24);
    return disclaimer.content;
}


export const DisclaimerService = {
    createDisclaimerToDB,
    getDisclaimerToDB,
}
