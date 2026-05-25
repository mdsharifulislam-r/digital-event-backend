import { Request, Response, NextFunction } from 'express';
import { AddonServices } from './addon.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createAddon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const result = await AddonServices.createAddonToDB(payload, req.user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Addon created successfully',
    data: result,
  });
});

const getAllAddons = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await AddonServices.getAllAddons();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Addons retrieved successfully',
    data: result,
  });
});

const updateAddon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const payload = req.body;
  const result = await AddonServices.updateAddonToDB(id, payload, req.user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Addon updated successfully',
    data: result,
  });
});

const deleteAddon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = await AddonServices.deleteAddonFromDB(id, req.user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Addon deleted successfully',
    data: result,
  });
});

const purchaseAddon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const user = req.user;
  const result = await AddonServices.purchaseAddonToDB(id, user as any);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Addon purchase initiated successfully',
    data: result,
  });
});

export const AddonController = {
  createAddon,
  getAllAddons,
  updateAddon,
  deleteAddon,
  purchaseAddon,
};
