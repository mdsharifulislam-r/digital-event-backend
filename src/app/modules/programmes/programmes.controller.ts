import { Request, Response, NextFunction } from 'express';
import { ProgrammesServices } from './programmes.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
const createProgrammes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    console.log(payload);
    payload.owner = req.user?.id;
    const result = await ProgrammesServices.createProgrammes(payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Programmes created successfully',
      data: result,
    });
  },
);

const getProgrammesById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await ProgrammesServices.getProgrammesById(id, req.user);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes retrieved successfully',
      data: result,
    });
  },
);

const updateProgrammes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const payload = req.body;
    console.log(payload);
    const result = await ProgrammesServices.updateProgrammes(id, payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes updated successfully',
      data: result,
    });
  },
);

const deleteProgrammes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await ProgrammesServices.deleteProgrammes(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes deleted successfully',
      data: result,
    });
  },
);

const getAllProgrammes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const user = req.user;
    const result = await ProgrammesServices.getAllProgrammes(
      query as Record<string, any>,
      user as any,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes retrieved successfully',
      data: result.programmes,
      pagination: result.paginationInfo,
    });
  },
);

const getAnalyticsForProgrammes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const query = req.query;
    const result = await ProgrammesServices.getAnalyticsForProgrammes(
      user as any,
      query as any,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes analytics retrieved successfully',
      data: result,
    });
  },
);

const getViewsAndClicksGraphData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const query = req.query;
    const result = await ProgrammesServices.getViewsAndClicksGraphData(
      user as any,
      query as any,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes graph data retrieved successfully',
      data: result,
    });
  },
);

const getRevenueGraphData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const query = req.query;
    const result = await ProgrammesServices.getRevenueGraphData(
      user as any,
      query as any,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes revenue graph data retrieved successfully',
      data: result,
    });
  },
);

const uploadProggrameImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const imageUrl = getSingleFilePath(req.files, 'image');
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes image uploaded successfully',
      data: imageUrl,
    });
  },
)


const getBookingCountForProgrammes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const programmeId = req.params.id;
    const result = await ProgrammesServices.getBookingCountForProgrammes(programmeId as any);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Booking count for programme retrieved successfully',
      data: result,
    });
  },
);

export const ProgrammesController = {
  createProgrammes,
  getProgrammesById,
  updateProgrammes,
  deleteProgrammes,
  getAllProgrammes,
  getAnalyticsForProgrammes,
  getViewsAndClicksGraphData,
  getRevenueGraphData,
  uploadProggrameImages,
  getBookingCountForProgrammes
};
