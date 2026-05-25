import { Schema, model } from 'mongoose';
import { ITicket, TicketModel } from './ticket.interface'; 

const ticketSchema = new Schema<ITicket, TicketModel>({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  file: { type: String, required: true },
}, {
  timestamps: true
});

export const Ticket = model<ITicket, TicketModel>('Ticket', ticketSchema);
