import express from 'express';
import { EventController } from './event.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { EventValidation } from './event.validation';
import tempAuth from '../../middlewares/tempAuth';

const router = express.Router();

router.route('/')
    .post(auth(USER_ROLES.ORGANIZATION), fileUploadHandler([
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
        },
        {
            name: 'artist_image',
            maxCount: 1,
        },
        {
            name: 'artist_cover_image',
            maxCount: 1,
        }
    ]), validateRequest(EventValidation.createEventFormDataSchema), EventController.createEvent)
    .get(auth(USER_ROLES.ORGANIZATION), EventController.getAllEvents);

router.route('/search')
    .get(tempAuth(), EventController.searchEvents);
router.route('/interest/:id')
    .post(auth(), validateRequest(EventValidation.makeFavoriteZodSchema), EventController.markInterest);
router.get('/interest', auth(), EventController.getFavoriteList);
router.route('/purchase/:id')
    .post(auth(), EventController.purchaseProgramme);
router.route('/:id')
    .get(tempAuth(), EventController.getEventById)
    .patch(auth(USER_ROLES.ORGANIZATION), fileUploadHandler([
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
        },
        {
            name: 'artist_image',
            maxCount: 1,
        },
        {
            name: 'artist_cover_image',
            maxCount: 1,
        }
    ]), EventController.updateEvent)
    .delete(auth(USER_ROLES.ORGANIZATION), EventController.deleteEvent);

export const EventRoutes = router;
