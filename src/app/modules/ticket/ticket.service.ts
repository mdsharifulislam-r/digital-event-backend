import { JwtPayload } from 'jsonwebtoken';
import { ITicket } from './ticket.interface';
import { Ticket } from './ticket.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const createTicket = async (data: Partial<ITicket>) => {
	const ticket = await Ticket.create(data);
	await RedisHelper.keyDelete(`tickets_all:*`);
	await RedisHelper.redisSet(`ticket:${ticket._id}`, ticket);
	return ticket;
}

const getTicketById = async (id: string) => {
	const cache = await RedisHelper.redisGet(`ticket:${id}`);
	if (cache) return cache;
	const ticket = await Ticket.findById(id);
	await RedisHelper.redisSet(`ticket:${id}`, ticket);
	return ticket;
}

const updateTicket = async (id: string, data: Partial<ITicket>) => {
	const updated = await Ticket.findByIdAndUpdate(id, data, { new: true });
	await RedisHelper.keyDelete(`tickets_all:*`);
	await RedisHelper.redisSet(`ticket:${id}`, updated);
	return updated;
}

const deleteTicket = async (id: string) => {
	const deleted = await Ticket.findByIdAndDelete(id);
	await RedisHelper.keyDelete(`tickets_all:*`);
	await RedisHelper.keyDelete(`ticket:${id}:*`);
	return deleted;
}

const getAllTickets = async (query: Record<string, any>, user?: JwtPayload) => {
	const cacheKey = user?.id ? `tickets_all:${user.id}` : `tickets_all`;
	const cache = await RedisHelper.redisGet(cacheKey, query);
	if (cache) return cache;

	const ticketQuery = new QueryBuilder(Ticket.find(), query)
		.search(['name'])
		.filter()
		.sort()
		.paginate();

	const [tickets, paginationInfo] = await Promise.all([
		ticketQuery.modelQuery.exec(),
		ticketQuery.getPaginationInfo(),
	]);

	await RedisHelper.redisSet(cacheKey, { tickets, paginationInfo }, query);
	return { tickets, paginationInfo };
}

export const TicketServices = {
	createTicket,
	getTicketById,
	updateTicket,
	deleteTicket,
	getAllTickets,
};
