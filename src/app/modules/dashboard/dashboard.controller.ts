import { Request, Response, NextFunction } from 'express';
import { DashboardServices } from './dashboard.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getOrganizationStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const stats = await DashboardServices.getOrganizationStatsData(user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Organization stats retrieved successfully',
        data: stats
    })
});


const getViewsAndClicksGraphData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const graphData = await DashboardServices.getViewsAndClicksGraphData(user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Graph data retrieved successfully',
        data: graphData
    })
});


const getRevenueGraphData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const graphData = await DashboardServices.getRevenueGraphData(user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Revenue graph data retrieved successfully',
        data: graphData
    })
});


const getAdminAnalyticsStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await DashboardServices.getAdminAnalyticsStats();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Admin analytics stats retrieved successfully',
        data: stats
    })
});


const getViewsAndClicksGraphDataForAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const graphData = await DashboardServices.getViewsAndClicksGraphDataForAdmin();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Admin graph data retrieved successfully',
        data: graphData
    })
});


const getAdminDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await DashboardServices.getAdminDashboardStats();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Admin dashboard stats retrieved successfully',
        data: stats
    })
});



const getRevenueGraphDataForAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const graphData = await DashboardServices.getRevenueGraphDataForAdmin();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Admin revenue graph data retrieved successfully',
        data: graphData
    })
});



const getSubscriptionCountAndPercentage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await DashboardServices.getSubscriptionCountAndPercentage();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Subscription count and percentage retrieved successfully',
        data: stats
    })
});



export const DashboardController = {
    getOrganizationStats,
    getViewsAndClicksGraphData,
    getRevenueGraphData,
    getAdminAnalyticsStats,
    getViewsAndClicksGraphDataForAdmin,
    getAdminDashboardStats,
    getRevenueGraphDataForAdmin,
    getSubscriptionCountAndPercentage
};
