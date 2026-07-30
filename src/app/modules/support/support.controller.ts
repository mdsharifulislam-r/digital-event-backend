import { Request, Response, NextFunction } from 'express';
import { SupportServices } from './support.service';
import catchAsync from '../../../shared/catchAsync';
import { kafkaProducer } from '../../../tools/kafka/kafka-producers/kafka.producer';
import sendResponse from '../../../shared/sendResponse';

const sendSupportMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { ...supportData } = req.body;
    await kafkaProducer.sendMessage("chat",{
        type:"send-support-message",
        data:supportData
    })
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Support message sent successfully',
        data: supportData
    })
})

const replyToSupportMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { ...supportData } = req.body;
    supportData.id = id
    await kafkaProducer.sendMessage("chat",{
        type:"reply-to-support-message",
        data:supportData
    })
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Support message sent successfully',
        data: supportData
    })
})


const getSupportMessages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await SupportServices.getSupportMessagesFromDB(req.query);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Support message get successfully',
        data: result.support,
        pagination: result.pagination
    })
})


export const SupportController = {
    sendSupportMessage,
    replyToSupportMessage,
    getSupportMessages
};
