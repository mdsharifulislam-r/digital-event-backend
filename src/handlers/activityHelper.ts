import { Activity } from "../app/modules/activity/activity.model";
import { User } from "../app/modules/user/user.model";
import { ACTIVITY_TYPE } from "../enums/activity";
import { USER_ROLES } from "../enums/user";
import { kafkaProducer } from "../tools/kafka/kafka-producers/kafka.producer";

export const sendActivity = async (payload:{title:string,description:string,user:any,type?:ACTIVITY_TYPE})=>{
   await kafkaProducer.sendMessage("utils", {type:"activity",data:payload});
}


export const saveActivity = async (payload:{title:string,description:string,user:any,type?:ACTIVITY_TYPE})=>{
 payload.type = payload.type || ACTIVITY_TYPE.OTHER
    const user = await User.findById(payload.user,{name:1});
    const title = `${user?.name} ${payload.title}`;
    const activity = await Activity.create({
        title:title,
        description:payload.description,
        user:payload.user,
        type:payload.type
    })

    const io = global.socketServer
    if(io){
        io.emit(`activity::${payload.user}`,activity)
    }

    const admins = await User.find({role:{ $in: [USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN] },verified:true,status:'active'}).distinct('_id')
    if(admins.length > 0){
        for(const admin of admins){
            io?.emit(`activity::${admin}`,activity)
        }
    };
}