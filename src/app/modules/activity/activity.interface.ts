import { Model, Types } from 'mongoose';
import { ACTIVITY_TYPE } from '../../../enums/activity';

export type IActivity = {
  title: string;
  description: string;
  user:Types.ObjectId;
  type:ACTIVITY_TYPE
};

export type ActivityModel = Model<IActivity>;
