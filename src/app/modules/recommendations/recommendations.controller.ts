import { Request, Response, NextFunction } from 'express';
import { RecommendationsServices } from './recommendations.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
const createRecommendation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    payload.owner = req.user?.id;
    const image = getSingleFilePath(req.files, 'image');
    if(image){
        payload.image = image;
    }
    const result = await RecommendationsServices.createRecommendation(payload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Recommendation created successfully',
        data: result,
    });
});

const getRecommendationById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await RecommendationsServices.getRecommendationById(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Recommendation retrieved successfully',
        data: result,
    });
});

const updateRecommendation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const payload = req.body;
    const image = getSingleFilePath(req.files, 'image');
    if(image){
        payload.image = image;
    }
    const result = await RecommendationsServices.updateRecommendation(id, payload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Recommendation updated successfully',
        data: result,
    });
});

const deleteRecommendation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await RecommendationsServices.deleteRecommendation(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Recommendation deleted successfully',
        data: result,
    });
});

const getAllRecommendations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const user = req.user;
    const result = await RecommendationsServices.getAllRecommendations(query as Record<string, any>, user as any);
    sendResponse(res, {
         success: true,
         statusCode: StatusCodes.OK,
         message: 'Recommendations retrieved successfully',
         data: result.recommendations,
         pagination: result.paginationInfo
    });
})


const getBulkRecommendations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const result = await RecommendationsServices.getBulkRecommendations(body?.ids as string[]||[]);
    sendResponse(res, {
         success: true,
         statusCode: StatusCodes.OK,
         message: 'Recommendations retrieved successfully',
         data: result,
    });
})

export const RecommendationsController = {
    createRecommendation,
    getRecommendationById,
    updateRecommendation,
    deleteRecommendation,
    getAllRecommendations,
    getBulkRecommendations
};
