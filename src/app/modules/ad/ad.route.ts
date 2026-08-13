import express from 'express';
import { AdController } from './ad.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AdValidations } from './ad.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import tempAuth from '../../middlewares/tempAuth';

const router = express.Router();

router.route("/")
    .get(auth(),AdController.getAllAds)
    .post(auth(),fileUploadHandler(),validateRequest(AdValidations.createAdZodSchema),AdController.createAd)

router.route("/analytics")
    .get(auth(),AdController.getAnalytics)

router.route("/bulk-gets")
    .post(auth(), validateRequest(AdValidations.getBulkAdZodSchema), AdController.getBulkAds)


router.route("/dwell-time")
    .post(tempAuth(), validateRequest(AdValidations.calculateDwellTimeZodSchema), AdController.calculateDwellTime)

router.route("/:id")
    .patch(auth(),fileUploadHandler(),validateRequest(AdValidations.updateAdZodSchema),AdController.updateAd)
    .delete(auth(),AdController.deleteAd)
    .get(auth(),AdController.singleAd)

export const AdRoutes = router;
