import { JwtPayload } from 'jsonwebtoken';
import { IRecommendations, RecommendationsModel } from './recommendations.interface';
import { Recommendations } from './recommendations.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { RedisHelper } from '../../../tools/redis/redis.helper';
import { sendActivity } from '../../../handlers/activityHelper';
import { ACTIVITY_TYPE } from '../../../enums/activity';
import { kafkaProducer } from '../../../tools/kafka/kafka-producers/kafka.producer';

const createRecommendation = async (data: Partial<IRecommendations>) => {
  const recommendation = await Recommendations.create(data);
  await RedisHelper.keyDelete(`recommendations_all:${data.owner}:*`);
  await RedisHelper.redisSet(`recommendation:${recommendation._id}`, recommendation);
  sendActivity({title:"New Recommendation Added",description:`Created recommendation ${recommendation?.name}`,user:data.owner,type:ACTIVITY_TYPE.RECOMMENDATION})
  return recommendation;
}

const getRecommendationById = async (id: string,user:JwtPayload) => {
  const cache = await RedisHelper.redisGet(`recommendation:${id}`);
  if (cache) {
      return cache;
  }
  const recommendation = await Recommendations.findById(id);
  await kafkaProducer.sendMessage("ad",{
    type:"recommendations-click",
    data:{recommendation_id:id,user_id:user.id}
  })
  await RedisHelper.redisSet(`recommendation:${id}`, recommendation);
  return recommendation;
}

const updateRecommendation = async (id: string, data: Partial<IRecommendations>) => {
  const updatedRecommendation = await Recommendations.findByIdAndUpdate(id, data, { new: true });
  await RedisHelper.keyDelete(`recommendations_all:${data.owner}:*`);
  await RedisHelper.redisSet(`recommendation:${id}`, updatedRecommendation);
  return updatedRecommendation;
}

const deleteRecommendation = async (id: string) => {
  const deletedRecommendation = await Recommendations.findByIdAndDelete(id);
  await RedisHelper.keyDelete(`recommendations_all:${deletedRecommendation?.owner}:*`);
  await RedisHelper.keyDelete(`recommendation:${id}:*`);
  return deletedRecommendation;
}

const getAllRecommendations = async (query: Record<string, any>,user:JwtPayload) => {
  const cache = await RedisHelper.redisGet(`recommendations_all:${user.id}`, query);
  if (cache) {
      return cache;
  }
    const recommendationQuery = new QueryBuilder(Recommendations.find({ owner: user.id }), query)
    .search(['name', 'category', 'location'])
    .filter()
    .sort()
    .paginate()
    const [recommendations, paginationInfo] = await Promise.all([
        recommendationQuery.modelQuery.exec(),
        recommendationQuery.getPaginationInfo()
    ])
    await RedisHelper.redisSet(`recommendations_all:${user.id}`, { recommendations, paginationInfo }, query);
    return { recommendations, paginationInfo };
}


const getBulkRecommendations = async (ids: string[]) => {
  const recommendations = await Recommendations.find({ _id: { $in: ids } });
  return recommendations;
}


export const RecommendationsServices = {
    createRecommendation,
    getRecommendationById,
    updateRecommendation,
    deleteRecommendation,
    getAllRecommendations,
    getBulkRecommendations
};
