import express from 'express';
import { AddonController } from './addon.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { AddonValidations } from './addon.validation';

const router = express.Router();

router.route('/')
  .post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(AddonValidations.createAddonSchema), AddonController.createAddon)
  .get(AddonController.getAllAddons);

router.route('/purchase/:id')
  .post(auth(), AddonController.purchaseAddon);

router.route('/:id')
  .patch(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(AddonValidations.updateAddonSchema), AddonController.updateAddon)
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), AddonController.deleteAddon);

export const AddonRoutes = router;
