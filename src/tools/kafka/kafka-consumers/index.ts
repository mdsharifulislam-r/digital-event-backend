import { adConsumer } from "./ad.consumer";
import { notificationConsumer } from "./notification.consumer";
import { transactionConsumer } from "./transaction.consumer";
import { userConsumer } from "./user.consumer";

export async function loadConsumer() {
    await Promise.all([notificationConsumer(),adConsumer(),transactionConsumer()]);
    console.log("consumer loaded");
}