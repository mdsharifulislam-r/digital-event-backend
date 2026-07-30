import { Schema, model } from 'mongoose';
import { IProgrammes, ProgrammesModel } from './programmes.interface';
import { Venue } from '../vanue/vanue.model';
import { Event } from '../event/event.model';

/* ---------------- Block Schema (Flexible for all 20+ types) ---------------- */
const BlockSchema = new Schema(
  {
    id: { type: String, required: true },
    module: { type: String, required: true },

    type: { type: String, required: true },

    animation: {
      type: {
        type: String,
      },
      delay_ms: Number,
      duration_ms: Number,
    },

    layout: {
      align: String,
      padding_top: Number,
      padding_bottom: Number,
      padding_x: Number,
      background: String,
      background_custom: String,
      text_color: String,
      title_color: String,
      eyebrow_color: String,
      card_background: String,
      card_text_color: String,
    },

    // Everything else dynamic per block type
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false },
);

/* ---------------- Page Schema ---------------- */
const ProgrammePageSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    blocks: { type: [BlockSchema], default: [] },
  },
  { _id: false },
);

/* ---------------- Main Programme Schema ---------------- */
const programmesSchema = new Schema<IProgrammes, ProgrammesModel>(
  {

    venue_id: { type: Schema.Types.ObjectId, required: false, ref: 'Venue' },

    owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },

    event_id: { type: Schema.Types.ObjectId, default: null, ref: 'Event' },

    title: { type: String, required: true },

    cover_image: { type: String },

    category: {
      type: String,
      enum: [
        'THEATRE',
        'SPORTS',
        'MUSIC',
        'EVENTS',
        'MUSEUM',
        'COMMUNITY',
        'CEREMONIES',
      ],
    },

    pages: { type: [ProgrammePageSchema], default: [] },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },

    is_free: { type: Boolean, default: true },

    price_pence: { type: Number, default: 0 },

    published_at: { type: Date },
    clicks: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

programmesSchema.pre('save',async function (next) {
  if(this.venue_id){
    await Venue.findByIdAndUpdate(this.venue_id, { $inc: { programmes_count: 1 } });
  }
  if(this.event_id){
    await Event.findByIdAndUpdate(this.event_id, {programme: this._id});
  }
  next();
})

programmesSchema.post('findOneAndDelete', async function (doc:any, next) {
  
  const venueId = doc.venue_id;
  if(venueId){
    await Venue.findByIdAndUpdate(venueId, { $inc: { programmes_count: -1 } });
  }
  next();
})

/* ---------------- Indexes ---------------- */
programmesSchema.index({ venue_id: 1 });
programmesSchema.index({ status: 1 });
programmesSchema.index({ category: 1 });

/* ---------------- Model ---------------- */
export const Programmes = model<IProgrammes, ProgrammesModel>(
  'Programmes',
  programmesSchema,
);