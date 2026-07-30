import express from 'express';
import { TicketController } from './ticket.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TicketValidations } from './ticket.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.route('/')
    .post(auth(),fileUploadHandler([{
      name: 'file',
      maxCount: 1
    }]),validateRequest(TicketValidations.createTicketZodSchema),TicketController.createTicket)
    .get(auth(),TicketController.getAllTickets);

router.route('/:id')
    .get(auth(),TicketController.getTicketById)
    .patch(auth(),fileUploadHandler([
      {
        name: 'file',
        maxCount: 1
      }
    ]),validateRequest(TicketValidations.updateTicketZodSchema),TicketController.updateTicket)
    .delete(auth(),TicketController.deleteTicket);


export const TicketRoutes = router;
