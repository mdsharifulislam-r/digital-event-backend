import express from 'express';
import { VanueController } from './vanue.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { VanueValidations } from './vanue.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.route('/')
    .post(auth(USER_ROLES.ORGANIZATION),fileUploadHandler([
      {
        name: 'cover_image',
        maxCount: 1,
      },
        {
        name: 'logo_image',
        maxCount: 1,
        }
    ]),validateRequest(VanueValidations.createVanueZodSchema),VanueController.createVanue)
    .get(auth(),VanueController.getMyAllVanue);

router.route('/:id')
    .get(auth(),VanueController.getVanueById)
    .patch(auth(USER_ROLES.ADMIN, USER_ROLES.ORGANIZATION),fileUploadHandler([
      {
        name: 'cover_image',
        maxCount: 1,
      },
        {
        name: 'logo_image',
        maxCount: 1,
        }
    ]),validateRequest(VanueValidations.updateVanueZodSchema),VanueController.updateVanue)
    .delete(auth(USER_ROLES.ADMIN, USER_ROLES.ORGANIZATION, USER_ROLES.SUPER_ADMIN),VanueController.deleteVanue);
export const VanueRoutes = router;
