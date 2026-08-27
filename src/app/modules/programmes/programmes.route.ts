import express from 'express';
import { ProgrammesController } from './programmes.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { ProgrammesValidations } from './programmes.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.route('/')
    .post(auth(USER_ROLES.ORGANIZATION),ProgrammesController.createProgrammes)
    .get(auth(),ProgrammesController.getAllProgrammes);



router.route('/analytics')
    .get(auth(USER_ROLES.ORGANIZATION),validateRequest(ProgrammesValidations.getAnalyticsForProgrammesSchema),ProgrammesController.getAnalyticsForProgrammes);

router.route('/graph-data')
    .get(auth(USER_ROLES.ORGANIZATION),validateRequest(ProgrammesValidations.getAnalyticsForProgrammesSchema),ProgrammesController.getViewsAndClicksGraphData);

router.route('/revenue-graph-data')
    .get(auth(USER_ROLES.ORGANIZATION),validateRequest(ProgrammesValidations.getAnalyticsForProgrammesSchema),ProgrammesController.getRevenueGraphData);

router.route('/dwell-time-graph-data')
    .get(auth(USER_ROLES.ORGANIZATION),validateRequest(ProgrammesValidations.getAnalyticsForProgrammesSchema),ProgrammesController.getDwellTimeForProgrammes);

router.post('/upload-images',auth(USER_ROLES.ORGANIZATION),fileUploadHandler(),ProgrammesController.uploadProggrameImages);

router.route('/booking-count/:id')
    .get(auth(USER_ROLES.ORGANIZATION),ProgrammesController.getBookingCountForProgrammes);

router.route("/answer-poll")
    .post(auth(),validateRequest(ProgrammesValidations.answerPollSchema),ProgrammesController.answerPoll);

router.route("/polls/:id")
    .get(auth(),ProgrammesController.getPollsInformationOfProgrammes);

router.route("/polls/:id/answers")
    .get(auth(),ProgrammesController.getPollAnswersByPollId);

router.route("/polls-thoughts-analytics/:id")
    .get(auth(USER_ROLES.ORGANIZATION),ProgrammesController.getsAnalayticsForProgrammes);

router.post('/user-thoughts',validateRequest(ProgrammesValidations.submitThoughtsSchema),auth(),ProgrammesController.submitUserThoughts);

router.route('/user-thoughts/:id')
    .get(auth(USER_ROLES.ORGANIZATION),ProgrammesController.getToughtsOfProgrammes)
    .patch(auth(USER_ROLES.ORGANIZATION),ProgrammesController.changeChangeStatusOfUserThoughts);



router.route('/:id')
    .get(auth(),ProgrammesController.getProgrammesById)
    .patch(auth(USER_ROLES.ORGANIZATION),ProgrammesController.updateProgrammes)
    .delete(auth(USER_ROLES.ORGANIZATION),ProgrammesController.deleteProgrammes);



export const ProgrammesRoutes = router;
