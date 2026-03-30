import { Request, Response } from 'express'
import {
    getCurrentReadingsService,
    getFlightLogsService,
    getTimeSeriesService,
} from '../services/environmental.service'
import { sendError } from '../utils/errorResponse'

export async function handleCurrentReadings(req: Request, res: Response) {
    try {
        const data = await getCurrentReadingsService()
        return res.status(200).json({
            status: 'success',
            message: 'Current readings retrieved',
            data,
        })
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleFlightLogs(req: Request, res: Response) {
    try {
        const data = await getFlightLogsService(req.query as any)
        return res.status(200).json({
            status: 'success',
            message: 'Flight logs retrieved',
            data,
        })
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleTimeSeries(req: Request, res: Response) {
    try {
        const data = await getTimeSeriesService(req.query as any)
        return res.status(200).json({
            status: 'success',
            message: 'Time series retrieved',
            data,
        })
    } catch (e) {
        return sendError(res, 400, e)
    }
}
