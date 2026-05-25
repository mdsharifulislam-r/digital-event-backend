import { Schema, model } from 'mongoose';
import {  IVenue, VenueModel } from './vanue.interface'; 
import { string } from 'zod/v4';

const venueSchema = new Schema<IVenue, VenueModel>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'pending',
  },
  cover_image: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
  },
  description: {
    type: String,
  },
  address_line1: {
    type: String,
    required: true,
  },
  address_line2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  zip_code: {
    type: String,
    required: true,
  },
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
  location:{
    type:{
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    }
  },
  contact_email: {
    type: String,
    required: true,
  },
  contact_phone: {
    type: String,
  },
  website: {
    type: String,
  },
  brand_color: {
    type: String,
  },
  programmes_count: {
    type: Number,
    default: 0,
  },
  events_count: {
    type: Number,
    default: 0,
  },
  total_downloads: {
    type: Number,
    default: 0,
  },
  total_revenue: {
    type: Number,
    default: 0,
  },
  
}, { timestamps: true });

venueSchema.index({ location: '2dsphere' });


export const Venue = model<IVenue, VenueModel>('Venue', venueSchema);
