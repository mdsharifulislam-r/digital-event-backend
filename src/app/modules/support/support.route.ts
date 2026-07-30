import express from 'express';
import { SupportController } from './support.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SupportValidations } from './support.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/')
    .post(validateRequest(SupportValidations.createSupportMessageZodSchema),SupportController.sendSupportMessage)
    .get(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),SupportController.getSupportMessages)

router.route('/:id')
    .patch(auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),validateRequest(SupportValidations.replyToSupportMessageZodSchema),SupportController.replyToSupportMessage)

export const SupportRoutes = router;
