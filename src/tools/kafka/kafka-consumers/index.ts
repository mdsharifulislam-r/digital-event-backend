import { Programmes } from "../../../app/modules/programmes/programmes.model";
import { adConsumer } from "./ad.consumer";
import { notificationConsumer } from "./notification.consumer";
import { proggramesConsumer } from "./proggrames.consumer";
import { transactionConsumer } from "./transaction.consumer";
import { userConsumer } from "./user.consumer";

export async function loadConsumer() {
    await Promise.all([notificationConsumer(),adConsumer(),transactionConsumer(),proggramesConsumer()]);
    console.log("consumer loaded");
}