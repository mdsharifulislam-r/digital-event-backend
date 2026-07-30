import { Model, Types } from "mongoose";

export type EventStatus = 'draft' | 'published' | 'archived' | 'cancelled';
export type PerformanceType = 'matinee' | 'evening' | 'all_day';

export interface EventHost {
  name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
}

export enum EVENT_CATEGORIES {
  THEATER = "Theater",
  MUSIC = "Music",
  SPORTS = "Sports",
  EVENTS = "Events",
  COMMUNITY = "Community",
  CEREMONIES = "Ceremonies"
}



export interface IEvent {
  title: string;
  category: EVENT_CATEGORIES;
  is_featured: boolean;
  price: number;
  tags: string[];
  author: Types.ObjectId;
  cover_image: string;
  gallery: string[];
  event_date: Date;
  description_html: string;
  address?: string;
  status: EventStatus;
  highlights: string[];
  location:{
  type: string;
  coordinates: number[];
  }
  get_tickets_url?: string;
  performances: Performance[];
  host: EventHost;
  qr_code_url?: string;
  vanue:Types.ObjectId;
  programme:Types.ObjectId;
  artist:Types.ObjectId;
  social: {
    share_url: string;
    share_text: string;
    views_count: number;
  };
  nearby_restaurants?:Types.ObjectId[];
  nearby_hotels?:Types.ObjectId[];
  nearby_bars?:Types.ObjectId[];
  qr_scan_count?: number;
  interest_count?: number;
  downloads_count?: number;
  revinge_count?: number;
}

export type EventModel = Model<IEvent>;



export type IClick ={
  item: Types.ObjectId;
  user: Types.ObjectId;
  type:"Event" | "Recommendations"|"Performances"
}

export type ClickModel = Model<IClick>&{
  recordClick: (itemId: Types.ObjectId, userId: Types.ObjectId, type:"Event" | "Recommendations") => Promise<IClick>;
}

export type IViews ={
  item: Types.ObjectId;
  count: number;
  type:"Event" | "Recommendations"; 
}

export type ViewsModel = Model<IViews>&{
  incrementViews: (itemId: Types.ObjectId, type:"Event" | "Recommendations") => Promise<IViews>;
}


export type IQrScan ={
  event: Types.ObjectId;
  user: Types.ObjectId;
  scannedAt: Date;
}

export type QrScanModel = Model<IQrScan>&{
  recordScan: (eventId: Types.ObjectId, userId: Types.ObjectId) => Promise<IQrScan>;
}


export type IFavorite ={
  item: Types.ObjectId;
  user: Types.ObjectId;
  type:"Event" | "Recommendations" | 'Venue';
}

export type FavoriteModel = Model<IFavorite>&{
  toggleFavorite: (itemId: Types.ObjectId, userId: Types.ObjectId, type:"Event" | "Recommendations"|"Venue"|'Performances') => Promise<{ favorited: boolean }>;
}




