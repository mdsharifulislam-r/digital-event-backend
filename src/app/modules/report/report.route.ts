import express from 'express';
import { ReportController } from './report.controller';

const router = express.Router();

router.get('/', ReportController); 

export const ReportRoutes = router;
