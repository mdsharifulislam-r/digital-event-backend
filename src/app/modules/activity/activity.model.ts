import { Schema, model } from 'mongoose';
import { IActivity, ActivityModel } from './activity.interface'; 
import { ACTIVITY_TYPE } from '../../../enums/activity';

const activitySchema = new Schema<IActivity, ActivityModel>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(ACTIVITY_TYPE),
    default:ACTIVITY_TYPE.OTHER,
  },
});

export const Activity = model<IActivity, ActivityModel>('Activity', activitySchema);
