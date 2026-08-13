import { Model, Types } from 'mongoose';

export type IAd = {
  title: string;
  description: string;
  imageUrl?: string;
  redirectUrl: string;
  user:Types.ObjectId;
  startDate: Date;
  endDate: Date;
  active: boolean;
  status:"active"|"delete"
  impressions: number;
  clicks: number;
  views: number;
  revenue: number;
}

export type AdModel = Model<IAd>;



export type IClick = {
  item: Types.ObjectId;
  user: Types.ObjectId;
  type:"Event" | "Recommendations" | "Ad" | "Programmes";
}

export type ClickModel = Model<IClick>;



export type IDwellTime = {
  item: Types.ObjectId;
  user: Types.ObjectId;
  type:"Event" | "Recommendations" | "Ad" | "Programmes";
  dwellTime: number;
  startTime: Date;
  endTime: Date;
}


export type DwellTimeModel = Model<IDwellTime>
