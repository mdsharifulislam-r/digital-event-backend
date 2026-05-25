import { Model, Types } from 'mongoose';

export interface IVenue {
  id: string;
  owner: Types.ObjectId;
  name: string;
  status: 'active' | 'suspended' | 'pending';
  cover_image: string;
  logo?: string;
  description?: string;
  // Location
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  country: string;
  zip_code: string;
  coordinates?: { latitude: number; longitude: number };
  location:{
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  }
  contact_email: string;
  contact_phone?: string;
  website?: string;
  // Branding
  brand_color?: string;
  
  programmes_count: number;
  events_count: number;
  total_downloads: number;
  total_revenue: number; // GBP
}
 

export type VenueModel = Model<IVenue>;
