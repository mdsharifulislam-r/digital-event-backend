import { FreeDownLoad } from "../../app/modules/booking/booking.model";
import { Subscription } from "../../app/modules/subscription/subscription.model";
import config from "../../config";
import { emailHelper } from "../../helpers/emailHelper";
import { emailTemplate } from "../../shared/emailTemplate";

const calculateMontlyDownloadFee = async () => {
    const date = new Date();
    const prices = await FreeDownLoad.aggregate([
        {
            $match: {
                createdAt:{
                    $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                    $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
                },
                status:"registered"           
            }
        },
        {
            $group:{
                
            }
        }
    ])
};



export const expiredSubscription = async () => {
try {

    const expiredSubscriptions = await Subscription.find({status:"active",endDate:{$lt:new Date()}}).populate('user','email name').lean()
    await Promise.all(expiredSubscriptions.map(async (subscription:any) => {
        await Subscription.updateOne({_id:subscription._id},{$set:{status:"expired"}})
        const expireEmailTemplate = emailTemplate.subscriptionExpired({
            email:subscription.user.email,
            subscriptionName:subscription.name,
            endDate:new Date(subscription.endDate).toString(),
            name:subscription.user.name,
            renewUrl:`${config.urls.dashboard}/owner/subscription`
        });
        emailHelper.sendEmail(expireEmailTemplate)
    }))
    
} catch (error) {
    
}
};