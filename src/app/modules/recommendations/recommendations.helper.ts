import { Click } from "../ad/ad.model";
import { Recommendations } from "./recommendations.model";


const handleClickAndViewOfRecommendations = async (recommendation_id: string, user_id: string) => {
    // Check if the user has already clicked or viewed the recommendation in the last 24 hours
    const existingClick = await Click.findOne({
        item: recommendation_id,
        user: user_id,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24 hours
    });

    if (existingClick) {
        return existingClick;
    }
    // If not, create a new click record
    const newClick = await Click.create({
        item: recommendation_id,
        user: user_id,
        type:"Recommendations"
    });

    await Recommendations.findByIdAndUpdate(recommendation_id, { $inc: {total_clicks: 1, total_views: 1} });

    return newClick;
};


export const RecommendationsHandler = {
    handleClickAndViewOfRecommendations
}