import { Request, Response, NextFunction } from 'express';
import { ArtistServices } from './artist.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createArtist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let payload = req.body;

    const image = getSingleFilePath(req.files, 'image');
    const cover_image = getSingleFilePath(req.files, 'cover_image');

    if (image) {
        payload.image = image;
    }
    if (cover_image) {
        payload.cover_image = cover_image;
    }

    const result = await ArtistServices.createArtist(payload, req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Artist created successfully',
        data: result,
    });
});

const getAllArtists = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ArtistServices.getAllArtists(req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Artists retrieved successfully',
        data: result.artists,
        pagination: result.paginationInfo,
    });
});


const getArtistById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await ArtistServices.singleArtist(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Artist retrieved successfully',
        data: result,
    });
});


const getEventsByArtist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await ArtistServices.getEventsUsingArtistId(id, req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Events retrieved successfully',
        data: result.events,
        pagination: result.paginationInfo,
    });
});


const updateArtist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    let payload = req.body;

    const image = getSingleFilePath(req.files, 'image');
    const cover_image = getSingleFilePath(req.files, 'cover_image');

    if (image) {
        payload.image = image;
    }
    if (cover_image) {
        payload.cover_image = cover_image;
    }

    const result = await ArtistServices.updateArtist(id, payload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Artist updated successfully',
        data: result,
    });
});

const deleteArtist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await ArtistServices.deleteArtist(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Artist deleted successfully',
        data: result,
    });
});


export const ArtistController = {
    createArtist,
    getAllArtists,
    getArtistById,
    getEventsByArtist,
    updateArtist,
    deleteArtist
};
