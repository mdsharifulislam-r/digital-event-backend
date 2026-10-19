import express from 'express';
import { BookingController } from './booking.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route("/")
    .get(auth(),BookingController.getMyAllProgrammes);

router.get("/address-wise-info",auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),BookingController.getBookingInformationAddressWise)

router.get("/ravninue-percentage",auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),BookingController.totalRavinuePercentance)

router.route("/:id")
    .delete(auth(USER_ROLES.USER),BookingController.deleteMyProgrammes);

export const BookingRoutes = router;
