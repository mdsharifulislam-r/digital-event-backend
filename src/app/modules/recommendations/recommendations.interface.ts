import { Model, Types } from 'mongoose';

export interface IRecommendations {
  name: string;
  image: string;
  category: string; // e.g. "Fine Dining" / "Boutique"
  rating: number;
  distance: string;
  price: string;
  location: string;
  description: string;
  website: string;
  owner:Types.ObjectId
}

export type RecommendationsModel = Model<IRecommendations>;
