import { Request, Response, NextFunction } from 'express';
import { VanueServices } from './vanue.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createVanue = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let payload = req.body;
    const cover_image = getSingleFilePath(req.files, 'cover_image');
    const logo_image = getSingleFilePath(req.files, 'logo_image');
    const jsonPayload = JSON.parse(payload.data);
    
    payload={
        ...jsonPayload,
        cover_image,
        logo: logo_image,
        owner: req.user?.id
    } as any;
    const result = await VanueServices.createVanue(payload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Vanue created successfully',
        data: result,
    });
});

const getVanueById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await VanueServices.getVanueById(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Vanue retrieved successfully',
        data: result,
    });
});

const updateVanue = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    let payload = req.body;
    const cover_image = getSingleFilePath(req.files, 'cover_image');
    const logo_image = getSingleFilePath(req.files, 'logo_image');

    payload = JSON.parse(payload.data);
        if (cover_image) {
        payload.cover_image = cover_image;
    }
    if (logo_image) {
        payload.logo = logo_image;
    }
    const result = await VanueServices.updateVanue(id, payload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Vanue updated successfully',
        data: result,
    });
});

const deleteVanue = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await VanueServices.deleteVanue(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Vanue deleted successfully',
        data: result,
    });
});

const getMyAllVanue = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const query = req.query;
    const result = await VanueServices.getMyAllVanue(user, query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Vanues retrieved successfully',
        data: result.vanues,
        pagination: result.paginationInfo
    })
})


export const VanueController = { createVanue, getVanueById, updateVanue, deleteVanue, getMyAllVanue };
