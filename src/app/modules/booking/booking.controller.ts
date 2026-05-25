import { Request, Response, NextFunction } from 'express';
import { BookingServices } from './booking.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getMyAllProgrammes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await BookingServices.getMyAllProgrammes(req.user, req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Programmes retrieved successfully',
        data: result.programmes,
        pagination: result.paginationInfo
    });
});


export const BookingController = {
    getMyAllProgrammes
};
