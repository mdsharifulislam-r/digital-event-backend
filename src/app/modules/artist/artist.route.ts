import express from 'express';
import { ArtistController } from './artist.controller';
import tempAuth from '../../middlewares/tempAuth';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { ArtistValidations } from './artist.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZATION),
  fileUploadHandler([
    { name: 'cover_image', maxCount: 1 },
  ]),
  validateRequest(ArtistValidations.createArtistZodSchema),
  ArtistController.createArtist
);

router.get('/',tempAuth(),ArtistController.getAllArtists);

router.get('/events/:id', tempAuth(), ArtistController.getEventsByArtist);
router.get('/:id', tempAuth(), ArtistController.getArtistById);

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZATION),
  fileUploadHandler([
    { name: 'cover_image', maxCount: 1 },
  ]),
  validateRequest(ArtistValidations.updateArtistZodSchema),
  ArtistController.updateArtist
);

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ORGANIZATION),
  ArtistController.deleteArtist
);


export const ArtistRoutes = router;
