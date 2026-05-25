import { Schema, model } from 'mongoose';
import { ITransaction, TransactionModel } from './transaction.interface'; 
import { TRANSACTION_PAYMENT_TYPE, TRANSACTION_STATUS, TRANSACTION_TYPE } from '../../../enums/transaction';

const transactionSchema = new Schema<ITransaction, TransactionModel>({
  title: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  trx_id: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  platform_charge: {
    type: Number,
    default: 0,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  proggramme: {
    type: Schema.Types.ObjectId,
    ref: 'Programmes',
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
  },
  status: {
    type: String,
    enum: Object.values(TRANSACTION_STATUS),
    default: TRANSACTION_STATUS.PENDING,
  },
  payment_status: {
    type: String,
    enum: Object.values(TRANSACTION_PAYMENT_TYPE),
    default: TRANSACTION_PAYMENT_TYPE.DABIT,
  },
  prev_trx_id: {
    type: String,
  },
  type: {
    type: String,
    enum:TRANSACTION_TYPE,
    default: TRANSACTION_TYPE.PAYMENT,
  },
}, {
  timestamps: true,
});



transactionSchema.index({ owner: 1, trx_id: 1 }, { unique: true });
transactionSchema.pre('save',async function (next) {
  this.trx_id = `TRX-${Math.floor(100000 + Math.random() * 900000)}`;
  // recent transaction
  const recentTransaction = await Transaction.findOne({ owner: this.owner }).sort({ createdAt: -1 });
  if (recentTransaction) {
    this.prev_trx_id = recentTransaction.trx_id;
  }
  next();
})

export const Transaction = model<ITransaction, TransactionModel>('Transaction', transactionSchema);
