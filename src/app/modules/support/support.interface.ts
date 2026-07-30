import { Model } from 'mongoose';

export type ISupport = {
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  role:"contractor" | "homeowner";
  subject: string;
  message: string;
  reply?: string;
  status:"pending" | "resolved"
};

export type SupportModel = Model<ISupport>;
