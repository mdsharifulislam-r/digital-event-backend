import { Schema, model } from 'mongoose';
import { IArtist, ArtistModel } from './artist.interface';

const artistSchema = new Schema<IArtist, ArtistModel>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  cover_image: { type: String, required: true },
  short_description: { type: String, required: false },
  category: { type: String, required: false },
  type: {
    type: String,
    enum: ["Solo Artist", "Band", "DJ", "Orchestra", "Comedian", "Speaker"],
    required: false
  },
  orgainzation: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  genres: { type: [String], required: false },
  instruments: { type: [String], required: false },
  languages: { type: [String], required: false },
  career_start_year: { type: Number, required: false },
  origin: { type: String, required: false },
}, {
  timestamps: true
});

export const Artist = model<IArtist, ArtistModel>('Artist', artistSchema);
