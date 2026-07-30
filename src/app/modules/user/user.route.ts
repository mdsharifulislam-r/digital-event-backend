import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/profile')
  .get(auth(), UserController.getUserProfile)
  .patch(
    auth(),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return UserController.updateProfile(req, res, next);
    }
  );

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  )
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.getAllUsers);

router.post("/follow", auth(USER_ROLES.USER),validateRequest(UserValidation.followUserZodSchema), UserController.followHost);

router.post("/suspend/:id", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(UserValidation.suspendUserZodSchema), UserController.suspendUser);

router.route('/upload-file').post(fileUploadHandler(), UserController.uploadFile);

router.delete('/delete-account', auth(),validateRequest(UserValidation.deleteAccountZodSchema) ,UserController.deleteAccount);
export const UserRoutes = router;
