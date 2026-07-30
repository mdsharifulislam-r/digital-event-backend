import { Model, Types } from 'mongoose';
import { TRANSACTION_PAYMENT_TYPE, TRANSACTION_STATUS, TRANSACTION_TYPE } from '../../../enums/transaction';

export type ITransaction = {
  title: string;
  owner: Types.ObjectId;
  trx_id: string;
  amount:number;
  platform_charge:number;
  order?: Types.ObjectId;
  user?: Types.ObjectId;
  organization?: Types.ObjectId;
  subscription?:Types.ObjectId
  proggramme?: Types.ObjectId;
  status: TRANSACTION_STATUS;
  payment_status:TRANSACTION_PAYMENT_TYPE
  prev_trx_id?:string
  type:TRANSACTION_TYPE
};

export type TransactionModel = Model<ITransaction>;
