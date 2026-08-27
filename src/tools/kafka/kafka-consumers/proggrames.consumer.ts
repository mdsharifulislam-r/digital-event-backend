import { ProgrammesServices } from "../../../app/modules/programmes/programmes.service"
import { kafkaConsumer } from "../kafka-producers/kafka.consumer"

export const proggramesConsumer = async ()=>{
    await kafkaConsumer({groupId:"proggrames",topic:"proggrames",cb:async (data:{type:string,data:any})=>{
        try {
            switch (data.type) {
                case "create-poll":
                    await ProgrammesServices.createPollFromProggrames(data.data.id);
                    break;
                case "answer-poll":
                    await ProgrammesServices.answerPoll(data.data);
                    break;
            }
        } catch (error) {
            console.log("proggrames consumer error",error)
        }
    }})
}