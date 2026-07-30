import config from '../../../config';
import { emailHelper } from '../../../helpers/emailHelper';
import { sendNotificationQueue } from '../../../helpers/notificationHelper';

import { RedisHelper } from '../../../tools/redis/redis.helper';
import QueryBuilder from '../../builder/QueryBuilder';
import { ISupport } from './support.interface';
import { Support } from './support.model';

const sendSupportMessageToAdmin = async (data: ISupport) => {
    const result = await Support.create(data);
    await RedisHelper.keyDelete('support:*');
    await emailHelper.sendEmail({
        to:config.email.from!,
        subject:result.subject,
        html:result.message
    });


    sendNotificationQueue({
        title:`New support message from ${data.first_name} ${data.last_name}`,
        message:result.message,
        isRead:false,
        receiver:[],
        filePath:'support',
        referenceId:result._id
    });
}


const replyToSupportMesseage = async (id: string,message: string) => {
    const getSupportMessage = await Support.findById(id);
    if(!getSupportMessage){
        return console.log('message not found');
    }
    getSupportMessage.reply = message;
    getSupportMessage.status = 'resolved';
    await getSupportMessage.save();
    await RedisHelper.keyDelete('support:*');
    await emailHelper.sendEmail({
        to:getSupportMessage.email,
        subject:`Re: ${getSupportMessage.subject}`,
        html:message
    })

}


const getSupportMessagesFromDB = async(query:Record<string,any>) => {
    const cache = await RedisHelper.redisGet('support',query);
    if(cache) return cache;
    const supportQuery = new QueryBuilder(Support.find({}),query).paginate().filter().sort();
    const [support,pagination] = await Promise.all([supportQuery.modelQuery.exec(),supportQuery.getPaginationInfo()]);
    await RedisHelper.redisSet('support',{support,pagination},query);
    return {support,pagination};
}


export const SupportServices = {
    sendSupportMessageToAdmin,
    replyToSupportMesseage,
    getSupportMessagesFromDB
};
