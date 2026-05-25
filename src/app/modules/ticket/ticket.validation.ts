import { z } from 'zod';

const createTicketZodSchema = z.object({
	body: z.object({
		name: z.string({ required_error: 'Ticket name is required' }),
		date: z.coerce.date({ required_error: 'Date is required' }),
	}),
});

const updateTicketZodSchema = z.object({
	body: z.object({
		name: z.string().optional(),
		date: z.coerce.date().optional()
	}),
});

export const TicketValidations = {
	createTicketZodSchema,
	updateTicketZodSchema,
};
