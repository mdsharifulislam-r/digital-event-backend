import { Model, Types } from 'mongoose';

export type IReport = {
  title: string;
  description: string;
  user:Types.ObjectId;
  organization:Types.ObjectId;
  images?: string[];
  item?: Types.ObjectId;
  type?: "Event" | "Programmes"
  status?: "pending" | "resolved" | "inProgress"
};

export type ReportModel = Model<IReport>;
