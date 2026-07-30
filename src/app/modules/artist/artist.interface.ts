import { Model, Types } from 'mongoose';

export type IArtist = {
  name: string;
  image: string;
  cover_image: string;
  orgainzation?: Types.ObjectId;
  short_description?: string;
  category?: string;
  type?: 'Solo Artist' | 'Band' | 'DJ' | 'Orchestra' | 'Comedian' | 'Speaker';
  genres?: string[];
  instruments?: string[];
  languages?: string[];
  career_start_year?: number;
  origin?: string;
};

export type ArtistModel = Model<IArtist>;
