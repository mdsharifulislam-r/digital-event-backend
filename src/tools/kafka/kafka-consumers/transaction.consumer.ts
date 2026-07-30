import { TransactionServices } from "../../../app/modules/transaction/transaction.service"
import { kafkaConsumer } from "../kafka-producers/kafka.consumer"

export const transactionConsumer = async () =>{
    await kafkaConsumer({groupId:"transaction",topic:"transaction",cb:async(data:{type:string,data:any})=>{
        try {

            switch(data.type){
                case "create":
                    await TransactionServices.createTransaction(data.data)
                    break;
                case "update":
                    await TransactionServices.updateTransaction(data.data.id,data.data.updateData)
                break;
                
            }
            
        } catch (error) {
            console.log("transaction consumer error",error)
        }
    }})
}