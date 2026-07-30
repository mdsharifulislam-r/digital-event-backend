import express from 'express';
import { DashboardController } from './dashboard.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get('/organization/stats',auth(USER_ROLES.ORGANIZATION), DashboardController.getOrganizationStats)
router.get('/organization/view-graph-data',auth(USER_ROLES.ORGANIZATION), DashboardController.getViewsAndClicksGraphData)
router.get('/organization/revenue-graph-data',auth(USER_ROLES.ORGANIZATION), DashboardController.getRevenueGraphData)

router.get('/admin/analytics-stats',auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getAdminAnalyticsStats)
router.get('/admin/view-graph-data',auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getViewsAndClicksGraphDataForAdmin)
router.get('/admin/dashboard-stats',auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getAdminDashboardStats)
router.get('/admin/revenue-graph-data',auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getRevenueGraphDataForAdmin)
router.get('/admin/subscription-count-percent',auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getSubscriptionCountAndPercentage)
export const DashboardRoutes = router;