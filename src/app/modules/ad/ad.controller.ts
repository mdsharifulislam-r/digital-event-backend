import { Request, Response, NextFunction } from 'express';
import { AdServices } from './ad.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createAd = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const image = getSingleFilePath(req.files, 'image');
    if(image){
        req.body.imageUrl = image
    }
    const payload = req.body;
    const result = await AdServices.createAdToDB(payload, req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Ad created successfully',
        data: result,
    });
});

const getAllAds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdServices.getAllAdsFromDB(req.user,req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Ads retrieved successfully',
        data: result.ads,
        pagination: result.pagination
    });
});


const singleAd = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await AdServices.getSingleAdFromDB(id,req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Ad retrieved successfully',
        data: result,
    });
});

const deleteAd = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await AdServices.deleteAdFromDB(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Ad deleted successfully',
        data: result,
    });
});

const updateAd = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const payload = req.body;
    const image = getSingleFilePath(req.files, 'image');
    if(image){
        payload.imageUrl = image
    }
    const result = await AdServices.updateAdToDB(id, payload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Ad updated successfully',
        data: result,
    });
});

const getBulkAds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { ids = [] } = req.body as { ids?: string[] };
    const result = await AdServices.getBulkAdsFromDB(ids);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Ads retrieved successfully',
        data: result,
    });
});

const getAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdServices.getAnalaytics(req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Analytics retrieved successfully',
        data: result,
    });
});


const calculateDwellTime = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    payload.user = req.user.id;
    await AdServices.calculateDwellTime(payload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Dwell time calculated successfully',
    });
});




export const AdController = {
    createAd,
    getAllAds,
    singleAd,
    deleteAd,
    updateAd,
    getBulkAds,
    getAnalytics,
    calculateDwellTime
};
