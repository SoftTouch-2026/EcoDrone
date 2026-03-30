import { Request, Response } from 'express'
import {
    getDashboardSummaryService,
    getActivityService,
    getVendorPerformanceService,
    getDronePerformanceService,
    getDeliveryLocationsService,
    getUserActivityService,
    getHourlyOrdersService,
} from '../services/reports.service'
import { sendError } from '../utils/errorResponse'

export async function handleDashboardSummary(
    req: Request,
    res: Response
) {
    try {
        const data = await getDashboardSummaryService()
        return res.status(200).json({
            status: 'success',
            message: 'Dashboard summary retrieved',
            data,
        })
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleActivity(req: Request, res: Response) {
    try {
        const limit = req.query.limit as string | undefined
        const data = await getActivityService(limit)
        return res.status(200).json({
            status: 'success',
            message: 'Activity retrieved',
            data,
        })
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleVendorPerformance(req: Request, res: Response) {
    try {
        const data = await getVendorPerformanceService(req.query as any)
        return res.status(200).json({
            status: 'success',
            message: 'Vendor performance retrieved',
            data,
        })
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleDronePerformance(req: Request, res: Response) {
    try {
        const data = await getDronePerformanceService(req.query as any)
        return res.status(200).json({
            status: 'success',
            message: 'Drone performance retrieved',
            data,
        })
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleDeliveryLocations(req: Request, res: Response) {
    try {
        const data = await getDeliveryLocationsService(req.query as any)
        return res.status(200).json({
            status: 'success',
            message: 'Delivery locations retrieved',
            data,
        })
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleUserActivity(req: Request, res: Response) {
    try {
        const data = await getUserActivityService(req.query as any)
        return res.status(200).json({
            status: 'success',
            message: 'User activity retrieved',
            data,
        })
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleHourlyOrders(req: Request, res: Response) {
    try {
        const data = await getHourlyOrdersService(req.query as any)
        return res.status(200).json({
            status: 'success',
            message: 'Hourly orders retrieved',
            data,
        })
    } catch (e) {
        return sendError(res, 400, e)
    }
}
