import express from 'express';
import { RecommendationsController } from './recommendations.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { RecommendationsValidations } from './recommendations.validation';

const router = express.Router();

router.route('/')
    .post(auth(USER_ROLES.ORGANIZATION),fileUploadHandler(),validateRequest(RecommendationsValidations.createRecommendationSchema),RecommendationsController.createRecommendation)
    .get(auth(),RecommendationsController.getAllRecommendations);

router.route('/bulk-gets')
    .post(auth(),validateRequest(RecommendationsValidations.getBulkRecommendationSchema),RecommendationsController.getBulkRecommendations);

router.route('/:id')
    .get(auth(),RecommendationsController.getRecommendationById)
    .patch(auth(USER_ROLES.ORGANIZATION),fileUploadHandler(),validateRequest(RecommendationsValidations.updateRecommendationSchema),RecommendationsController.updateRecommendation)
    .delete(auth(USER_ROLES.ORGANIZATION),RecommendationsController.deleteRecommendation);

export const RecommendationsRoutes = router;
