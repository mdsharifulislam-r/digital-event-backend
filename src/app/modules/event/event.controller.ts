import { Request, Response, NextFunction } from 'express';
import { EventServices } from './event.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getMultipleFilesPath, getSingleFilePath } from '../../../shared/getFilePath';
import { ArtistServices } from '../artist/artist.service';

const createEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  payload.author = req.user?.id;
  const cover_image = getSingleFilePath(req.files, 'cover_image');
  if (cover_image) {
    payload.cover_image = cover_image;
  }
  const gallery = getMultipleFilesPath(req.files, 'gallery');
  if (gallery?.length || 0 > 0) {
    payload.gallery = gallery;
  }

  const host_image = getSingleFilePath(req.files, 'host_avatar');
  if (host_image) {
    payload.host = JSON.parse(payload.host);
    payload.host.avatar_url = host_image;
  }

  if (payload.performances) {
    payload.performances = JSON.parse(payload.performances);
  }

  if (payload.social) {
    payload.social = JSON.parse(payload.social);
  }

  if (payload.host) {
    payload.host = JSON.parse(payload.host);
  }

  const result = await EventServices.createEvent(payload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Event created successfully',
    data: result,
  });
});

const getEventById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = await EventServices.getEventById(id, req?.user?.id as string, req.query?.qrCode === 'true');
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event retrieved successfully',
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const payload = req.body;
  const cover_image = getSingleFilePath(req.files, 'cover_image');
  if (cover_image) {
    payload.cover_image = cover_image;
  }
  const gallery = getMultipleFilesPath(req.files, 'gallery');
  if (gallery?.length || 0 > 0) {
    payload.gallery = gallery;
  }

  const host_image = getSingleFilePath(req.files, 'host_avatar');
  if (host_image) {
    payload.host = JSON.parse(payload.host);
    payload.host.avatar_url = host_image;
  }

  if (payload.performances) {
    payload.performances = JSON.parse(payload.performances);
  }

  if (payload.social) {
    payload.social = JSON.parse(payload.social);
  }

  if (payload.host) {
    payload.host = JSON.parse(payload.host);
  }

  const result = await EventServices.updateEvent(id, payload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event updated successfully',
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = await EventServices.deleteEvent(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event deleted successfully',
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const user = req.user;
  const result = await EventServices.getAllEvents(query as Record<string, any>, user as any);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Events retrieved successfully',
    data: result.events,
    pagination: result.paginationInfo,
  });
});


const searchEvents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const result = await EventServices.searchEvents(query as Record<string, any>, req.user as any);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Events retrieved successfully',
    data: result.events,
    pagination: result.paginationInfo,
  });
});

const markInterest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = await EventServices.makeFavorite(id, req.user?.id as string, req.body?.type);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event marked successfully',
    data: result,
  });
});

const purchaseProgramme = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = await EventServices.purchaseProggramme(id, req.user?.id as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Programme purchased successfully',
    data: result,
  });
});


const getFavoriteList = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await EventServices.getAllFavorites(req.user, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Favorite list retrieved successfully',
    data: result.favorites,
    pagination: result.paginationInfo,
  });
});



export const EventController = {
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
  searchEvents,
  markInterest,
  purchaseProgramme,
  getFavoriteList
};
