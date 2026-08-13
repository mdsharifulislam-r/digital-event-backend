import { Schema, model } from 'mongoose';
import { IAd, AdModel, IClick, ClickModel, IDwellTime, DwellTimeModel } from './ad.interface'; 

const adSchema = new Schema<IAd, AdModel>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  redirectUrl: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  active: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'delete'], default: 'active' },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
}, {
  timestamps: true
});

export const Ad = model<IAd, AdModel>('Ad', adSchema);


const clickSchema = new Schema<IClick, ClickModel>({
  item: { type: Schema.Types.ObjectId, required: true,refPath:"type" },
  user: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['Event', 'Recommendations', 'Ad','Programmes'], required: true },
}, {
  timestamps: true
});

export const Click = model<IClick, ClickModel>('Click', clickSchema);
const dwellTimeSchema = new Schema<IDwellTime, DwellTimeModel>({
  item: { type: Schema.Types.ObjectId, required: true,refPath:"type" },
  user: { type: Schema.Types.ObjectId, required: false },
  type: { type: String, enum: ['Event', 'Recommendations', 'Ad','Programmes'], required: true },
  dwellTime: { type: Number, required: false,default:0 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
}, {
  timestamps: true
});

function calculateDwellTime(startTime: Date, endTime: Date): number {
  const timeDiff = endTime.getTime() - startTime.getTime();
  return Math.floor(timeDiff / 1000);
}

dwellTimeSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.dwellTime = calculateDwellTime(this.startTime, this.endTime);
  }
  next();
});

export const DwellTime = model<IDwellTime, DwellTimeModel>('DwellTime', dwellTimeSchema);
