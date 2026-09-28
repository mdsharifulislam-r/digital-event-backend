import { Notification } from "../../app/modules/notification/notification.model";
import { sendRealtimeNotification } from "../../helpers/notificationHelper";

export const sendScheduleNotification = async () => {
    console.log('sendScheduleNotification');
    const notification = await Notification.find({is_schedule_notification: true, schedule_time: {$lte: new Date()}}).lean().exec()
    if(notification.length){
        for(const data of notification){
            await sendRealtimeNotification(data);
        }
    }
};