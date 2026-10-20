import { Types } from 'mongoose';
import { Model } from 'mongoose';

export type ITicket = {
  name: string;
  date: Date;
  file: string;
  user:Types.ObjectId
};

export type TicketModel = Model<ITicket>;
