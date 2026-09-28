import cron from 'node-cron'
import { sendScheduleNotification } from './handlers/sendScheduleNotification';
import { expiredSubscription } from './handlers/calculateMonthlyDownloadFee';

export const worker = () => {
    cron.schedule('*/10 * * * *', () => {
        expiredSubscription()
        sendScheduleNotification()
    });
}