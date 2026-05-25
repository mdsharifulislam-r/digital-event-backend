import { Request, Response, NextFunction } from 'express';
import { TicketServices } from './ticket.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createTicket = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const payload = req.body;
    const file = getSingleFilePath(req.files, 'file');
    if(file){
        payload.file = file
    }
	const result = await TicketServices.createTicket(payload);
	sendResponse(res, {
		success: true,
		statusCode: StatusCodes.CREATED,
		message: 'Ticket created successfully',
		data: result,
	});
});

const getTicketById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	const result = await TicketServices.getTicketById(id);
	sendResponse(res, {
		success: true,
		statusCode: StatusCodes.OK,
		message: 'Ticket retrieved successfully',
		data: result,
	});
});

const updateTicket = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	const payload = req.body;
    const file = getSingleFilePath(req.files, 'file');
    if(file){
        payload.file = file
    }
	const result = await TicketServices.updateTicket(id, payload);
	sendResponse(res, {
		success: true,
		statusCode: StatusCodes.OK,
		message: 'Ticket updated successfully',
		data: result,
	});
});

const deleteTicket = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const id = req.params.id;
	const result = await TicketServices.deleteTicket(id);
	sendResponse(res, {
		success: true,
		statusCode: StatusCodes.OK,
		message: 'Ticket deleted successfully',
		data: result,
	});
});

const getAllTickets = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const query = req.query as Record<string, any>;
	const user = req.user;
	const result = await TicketServices.getAllTickets(query, user as any);
	sendResponse(res, {
		success: true,
		statusCode: StatusCodes.OK,
		message: 'Tickets retrieved successfully',
		data: result.tickets,
		pagination: result.paginationInfo,
	});
});

export const TicketController = { createTicket, getTicketById, updateTicket, deleteTicket, getAllTickets };
