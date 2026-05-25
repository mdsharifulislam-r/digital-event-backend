import express from 'express';
import { ProgrammesController } from './programmes.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/')
    .post(auth(USER_ROLES.ORGANIZATION),ProgrammesController.createProgrammes)
    .get(auth(),ProgrammesController.getAllProgrammes);


router.route('/:id')
    .get(auth(),ProgrammesController.getProgrammesById)
    .patch(auth(USER_ROLES.ORGANIZATION),ProgrammesController.updateProgrammes)
    .delete(auth(USER_ROLES.ORGANIZATION),ProgrammesController.deleteProgrammes);

export const ProgrammesRoutes = router;
