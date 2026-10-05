import { Schema, model } from 'mongoose';
import { IReport, ReportModel } from './report.interface'; 

const reportSchema = new Schema<IReport, ReportModel>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String }],
  item: { type: Schema.Types.ObjectId, refPath: 'type' },
  type: { type: String, enum: ['Event', 'Programmes'] },
  status: { type: String, enum: ['pending', 'resolved', 'inProgress'], default: 'pending' }
}, {
  timestamps: true
});

export const Report = model<IReport, ReportModel>('Report', reportSchema);
