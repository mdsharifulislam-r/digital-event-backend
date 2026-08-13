import { AdHandler } from "../../../app/modules/ad/ad.handler";
import { ProgrammesHelper } from "../../../app/modules/programmes/programmes.helper";
import { RecommendationsHandler } from "../../../app/modules/recommendations/recommendations.helper";
import { kafkaConsumer } from "../kafka-producers/kafka.consumer";

export const adConsumer = async () => {
    await kafkaConsumer({groupId:"ad",topic:"ad",cb:async(data:{type:string,data:any})=>{
        try {
            switch (data.type) {
                case "click":
                    await AdHandler.handleClickAndViewOfAd(data.data.ad_id, data.data.user_id);
                    break;
                case "recommendations-click":
                    await RecommendationsHandler.handleClickAndViewOfRecommendations(data.data.recommendation_id, data.data.user_id);
                    break;
                case "programmes-click":
                    await ProgrammesHelper.handleProgrammesClickAndView(data.data.programmeId, data.data.userId);
                    break;
                case "dwell-time":
                    await AdHandler.handleDwellTimeOfAd(data.data);
                    break;
            }
        } catch (error) {
            console.log(error);
            
        }
    }})
};