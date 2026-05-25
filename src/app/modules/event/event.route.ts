import express from 'express';
import { EventController } from './event.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { EventValidation } from './event.validation';

const router = express.Router();

router.route('/')
  .post(auth(USER_ROLES.ORGANIZATION),fileUploadHandler([
    {
        name: 'cover_image',
        maxCount: 1,
    },
    {
        name: 'gallery',
        maxCount: 5,
    },
    {
        name: 'host_avatar',
        maxCount: 1,
    }
  ]),validateRequest(EventValidation.createEventFormDataSchema),EventController.createEvent)
  .get(auth(USER_ROLES.ORGANIZATION),EventController.getAllEvents);

router.route('/search')
    .get(auth(),EventController.searchEvents);
router.route('/interest/:id')
    .post(auth(),EventController.markInterest);
router.route('/purchase/:id')
    .post(auth(),EventController.purchaseProgramme);
router.route('/:id')
  .get(auth(),EventController.getEventById)
  .patch(auth(USER_ROLES.ORGANIZATION),EventController.updateEvent)
  .delete(auth(USER_ROLES.ORGANIZATION),EventController.deleteEvent);

export const EventRoutes = router;
