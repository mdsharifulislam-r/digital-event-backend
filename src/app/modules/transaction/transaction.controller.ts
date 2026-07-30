import { Request, Response, NextFunction } from 'express';
import { TransactionServices } from './transaction.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const getTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { transactions, paginationInfo } = await TransactionServices.getTransactions(req.query,user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Transactions retrieved successfully',
        data: transactions,
        pagination: paginationInfo
    })
});


export const TransactionController = { getTransactions };
