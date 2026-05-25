import { Schema, model } from 'mongoose';
import { IRecommendations, RecommendationsModel } from './recommendations.interface'; 

const recommendationsSchema = new Schema<IRecommendations, RecommendationsModel>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, required: true },
  distance: { type: String, required: true },
  price: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  website: { type: String, required: true },
  owner:{type: Schema.Types.ObjectId, ref:'User', required:true}
}, {
  timestamps: true,
});

export const Recommendations = model<IRecommendations, RecommendationsModel>('Recommendations', recommendationsSchema);
