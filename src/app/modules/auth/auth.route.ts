import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.loginUser
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword
);

router.post(
  '/verify-email',
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyEmail
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword
);

router.post(
  '/change-password',
  auth(),
  validateRequest(AuthValidation.createChangePasswordZodSchema),
  AuthController.changePassword
);

router.post(
  '/save-face-verification',
  auth(),
  fileUploadHandler(),
  validateRequest(AuthValidation.saveFaceDiscriminatorZodSchema),
  AuthController.saveFaceDiscriminatorToDB
);

router.post(
  '/face-login',
  fileUploadHandler(),
  validateRequest(AuthValidation.saveFaceDiscriminatorZodSchema),
  AuthController.faceLogin
);

router.post(
  '/social-login',
  validateRequest(AuthValidation.socialSignInZodSchema),
  AuthController.socialSignIn
);

router.post(
  '/logout',
  auth(),
  AuthController.logoutUser
);

export const AuthRoutes = router;
