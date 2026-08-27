import { Request, Response, NextFunction } from 'express';
import { ProgrammesServices } from './programmes.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { kafkaProducer } from '../../../tools/kafka/kafka-producers/kafka.producer';
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


const getDwellTimeForProgrammes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ProgrammesServices.getWeekDaysDwellTime(req.user as any,req.query as any);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Dwell time for programme retrieved successfully',
      data: result,
    });
  },
);


const answerPoll = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    payload.user = req.user?.id
    await kafkaProducer.sendMessage("proggrames",{
      type:"answer-poll",
      data:payload
    })
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Poll answer submitted successfully',
      data: payload,
    });
  },
);


const submitUserThoughts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    payload.user = req.user?.id
    const result = await ProgrammesServices.submitUserThoughts(payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User thoughts submitted successfully',
      data: result,
    });
  },
);

const changeChangeStatusOfUserThoughts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const payload = req.body;
    const result = await ProgrammesServices.changeChangeStatusOfUserThoughts(id,payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User thoughts status changed successfully',
      data: result,
    });
  },
)

const getToughtsOfProgrammes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const programmesId = req.params.id;
    const query = req.query;
    const result = await ProgrammesServices.getToughtsOfProgrammes(programmesId,query as any);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes toughts retrieved successfully',
      data: result.thoughts,
      pagination: result.paginationInfo
    });
  },
)


const getPollsInformationOfProgrammes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const programmesId = req.params.id;
    const result = await ProgrammesServices.getPollsInformationOfProgrammes(programmesId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes polls retrieved successfully',
      data: result,
    });
  },
)

const getPollAnswersByPollId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pollId = req.params.id;
    const result = await ProgrammesServices.getPollAnswersByPollId(pollId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Poll answers retrieved successfully',
      data: result,
    });
  },
)

const getsAnalayticsForProgrammes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const programmesId = req.params.id;
    const result = await ProgrammesServices.getsAnalayticsForProgrammes(programmesId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Programmes analytics retrieved successfully',
      data: result,
    });
  },
)

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
  getBookingCountForProgrammes,
  getDwellTimeForProgrammes,
  answerPoll,
  submitUserThoughts,
  changeChangeStatusOfUserThoughts,
  getToughtsOfProgrammes,
  getPollsInformationOfProgrammes,
  getPollAnswersByPollId,
  getsAnalayticsForProgrammes
};
