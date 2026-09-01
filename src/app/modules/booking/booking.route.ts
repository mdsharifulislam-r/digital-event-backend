import express from 'express';
import { BookingController } from './booking.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route("/")
    .get(auth(USER_ROLES.USER),BookingController.getMyAllProgrammes);

router.route("/:id")
    .delete(auth(USER_ROLES.USER),BookingController.deleteMyProgrammes);

export const BookingRoutes = router;
