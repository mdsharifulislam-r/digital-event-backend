import express from 'express';
import { TransactionController } from './transaction.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/')
    .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),TransactionController.getTransactions)
export const TransactionRoutes = router;
