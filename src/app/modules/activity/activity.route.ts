import express from 'express';
import { ActivityController } from './activity.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route("/")
    .get(auth(),ActivityController.getMyAllActivity); 

export const ActivityRoutes = router;
