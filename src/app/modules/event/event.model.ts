import { Schema, Types, model } from 'mongoose';
import { IEvent, EventModel, EVENT_CATEGORIES, IQrScan, QrScanModel, FavoriteModel, IFavorite } from './event.interface'; 
import { Venue } from '../vanue/vanue.model';
import { EventHelper } from './event.helper';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const eventSchema = new Schema<IEvent, EventModel>({
  title: { type: String, required: true },
  category: { type: String, enum: Object.values(EVENT_CATEGORIES), required: true },
  is_featured: { type: Boolean, default: false },
  tags: [{ type: String }],
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  cover_image: { type: String, required: true },
  gallery: [{ type: String }],
  description_html: { type: String, required: true },
  highlights: [{ type: String }],
  get_tickets_url: { type: String },
  performances: [{ 
    date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    type: { type: String, enum: ['matinee', 'evening', 'all_day'], required: true }
  }],
  qr_code_url: { type: String },
  host: {
    name: { type: String, required: true },
    username: { type: String },
    avatar_url: { type: String },
    bio: { type: String },
    is_verified: { type: Boolean, default: false }
  },
  price: { type: Number, default: 0 },
  event_date: { type: Date, required: true },
  vanue: { type: Schema.Types.ObjectId, required: true, ref: 'Venue' },
  programme: { type: Schema.Types.ObjectId, required: true, ref: 'Programmes' },
  social: {
    share_url: { type: String, required: true },
    share_text: { type: String, required: true },
    views_count: { type: Number, default: 0 },
  },
  nearby_restaurants: [{ type: Schema.Types.ObjectId, ref: 'Recommendations' }],
  nearby_hotels: [{ type: Schema.Types.ObjectId, ref: 'Recommendations' }],
  nearby_bars: [{ type: Schema.Types.ObjectId, ref: 'Recommendations' }],
  address: { type: String },
  status: { type: String, enum: ['draft', 'published', 'archived', 'cancelled'], default: 'draft' },
  location: {
    type: { type: String, enum: ['Point'], },
    coordinates: { type: [Number], }
  },
  qr_scan_count: { type: Number, default: 0 },
  interest_count: { type: Number, default: 0 },
  downloads_count: { type: Number, default: 0 },
  revinge_count: { type: Number, default: 0 },
}, {
  timestamps: true,
});

eventSchema.index({ location: '2dsphere' });

eventSchema.pre('save', async function(next) {
  const venue = await Venue.findById(this.vanue);
  if (venue) {
    this.location = {
      type: 'Point',
      coordinates: [venue.location.coordinates[0], venue.location.coordinates[1]],
    };
    this.address = venue.address_line1;
    next();
  }

  await EventHelper.saveQrCode(this._id.toString());
  
})

export const Event = model<IEvent, EventModel>('Event', eventSchema);


export const qrScanSchema = new Schema<IQrScan, QrScanModel>({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scannedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
})

qrScanSchema.index({ event: 1, user: 1 }, { unique: true });
qrScanSchema.statics.recordScan = async function(eventId: Types.ObjectId, userId: Types.ObjectId) {
  const existingScan = await this.findOne({ event: eventId, user: userId });
  if (existingScan) {
    return existingScan;
  }
  const newScan = await this.create({ event: eventId, user: userId });
  await Event.findByIdAndUpdate(eventId, { $inc: { qr_scan_count: 1 } });
  return newScan;
}

export const QrScan = model<IQrScan, QrScanModel>('QrScan', qrScanSchema);


const favoriteSchema = new Schema<IFavorite, FavoriteModel>({
  item: { type: Schema.Types.ObjectId, required: true,refPath:"type" },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  type: { type: String, enum: ['Event', 'Recommendations'], required: true },
}, {
  timestamps: true,
})

favoriteSchema.index({ item: 1, user: 1, type: 1 }, { unique: true });
favoriteSchema.statics.toggleFavorite = async function(itemId: Types.ObjectId, userId: Types.ObjectId, type:"Event" | "Recommendations") {
  const existingFavorite = await this.findOne({ item: itemId, user: userId, type });
  if (existingFavorite) {
    await existingFavorite.deleteOne();
    await Event.findByIdAndUpdate(itemId, { $inc: { interest_count: -1 } });
    await RedisHelper.keyDelete(`event:${itemId}:${userId}:*`);
    return { favorited: false };
  }
  await this.create({ item: itemId, user: userId, type });
  await Event.findByIdAndUpdate(itemId, { $inc: { interest_count: 1 } });
  await RedisHelper.keyDelete(`event:${itemId}:${userId}:*`);
  return { favorited: true };
}

export const Favorite = model<IFavorite, FavoriteModel>('Favorite', favoriteSchema);