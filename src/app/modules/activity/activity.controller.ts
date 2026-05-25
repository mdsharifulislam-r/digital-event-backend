import { Request, Response, NextFunction } from 'express';
import { ActivityServices } from './activity.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getMyAllActivity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ActivityServices.getMyAllActivity(req.user, req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Activity retrieved successfully',
        data: result.activities,
        pagination: result.paginationInfo
    });
});


export const ActivityController = {
    getMyAllActivity
};
