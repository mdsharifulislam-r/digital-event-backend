import { JwtPayload } from 'jsonwebtoken';
import { ITransaction } from './transaction.interface';
import { Transaction } from './transaction.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';


const createTransaction = async (transactionData: ITransaction) => {
    const transaction = new Transaction(transactionData);
    return await transaction.save();
}

const updateTransaction = async (transactionId: string, updateData: Partial<ITransaction>) => {
    const updatedTransaction = await Transaction.findByIdAndUpdate(transactionId, updateData, { new: true });
    return updatedTransaction;
}

const getTransactions = async (query: Record<string, any>,user:JwtPayload) => {
    const initQuery = [USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN].includes(user.role) ? {} : { owner: user.id };
    const transactionQuery = new QueryBuilder(Transaction.find(initQuery), query)
    .search(['trx_id', 'type'])
    .filter()
    .sort()
    .paginate()
    const [transactions, paginationInfo] = await Promise.all([
        transactionQuery.modelQuery.populate('owner','name email image').exec(),
        transactionQuery.getPaginationInfo()
    ])
    return { transactions, paginationInfo };
}


export const TransactionServices = {
    createTransaction,
    updateTransaction,
    getTransactions
};
