import { Model } from 'mongoose';

export type ITicket = {
  name: string;
  date: Date;
  file: string;
};

export type TicketModel = Model<ITicket>;
