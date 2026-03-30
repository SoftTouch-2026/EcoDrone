import { Request, Response } from 'express'
import { sendError } from '../utils/errorResponse'
import {
    CreateTripInput,
    UpdateTripInput,
    DeleteTripInput,
    GetTripInput,
    GetTripsInput,
    StartTripInput,
    EndTripInput,
} from '../utils/types'
import {
    createTripService,
    updateTripService,
    deleteTripService,
    getTripService,
    getTripsService,
    startTripService,
    endTripService,
} from '../services/trips.service'
import { createAuditLog } from '../services/audit.service'

export const handleCreateTripRequest = async (
    req: Request<{}, {}, CreateTripInput['body']>,
    res: Response
) => {
    try {
        const trip = await createTripService(req.body)
        await createAuditLog({
            action: 'trip.create',
            resourceType: 'trip',
            resourceId: trip.id,
            actorId: res.locals.user?.id,
            message: 'Trip created',
            metadata: { order_id: req.body.order_id },
            success: true,
            req,
        })
        res.status(201).json(trip)
    } catch (e) {
        await createAuditLog({
            action: 'trip.create',
            resourceType: 'trip',
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Create trip failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleUpdateTripRequest = async (
    req: Request<{}, {}, UpdateTripInput['body']>,
    res: Response
) => {
    try {
        const trip = await updateTripService(req.body)
        await createAuditLog({
            action: 'trip.update',
            resourceType: 'trip',
            resourceId: trip.id,
            actorId: res.locals.user?.id,
            message: 'Trip updated',
            success: true,
            req,
        })
        res.status(200).json(trip)
    } catch (e) {
        await createAuditLog({
            action: 'trip.update',
            resourceType: 'trip',
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Update trip failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleDeleteTripRequest = async (
    req: Request<DeleteTripInput['params'], {}, {}>,
    res: Response
) => {
    const id = req.params?.id
    try {
        const trip = await deleteTripService(req.params)
        await createAuditLog({
            action: 'trip.delete',
            resourceType: 'trip',
            resourceId: id,
            actorId: res.locals.user?.id,
            message: 'Trip deleted',
            success: true,
            req,
        })
        res.status(200).json(trip)
    } catch (e) {
        await createAuditLog({
            action: 'trip.delete',
            resourceType: 'trip',
            resourceId: id,
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Delete trip failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleGetTripRequest = async (
    req: Request<GetTripInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const trip = await getTripService(req.params)
        res.status(200).json(trip)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleGetTripsRequest = async (
    req: Request<{}, {}, {}, GetTripsInput['query']>,
    res: Response
) => {
    try {
        const result = await getTripsService(req.query)
        res.status(200).json(result)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleStartTripRequest = async (
    req: Request<{}, {}, StartTripInput['body']>,
    res: Response
) => {
    try {
        const trip = await startTripService(req.body)
        await createAuditLog({
            action: 'trip.start',
            resourceType: 'trip',
            resourceId: trip.id,
            actorId: res.locals.user?.id,
            message: 'Trip started',
            success: true,
            req,
        })
        res.status(200).json(trip)
    } catch (e) {
        await createAuditLog({
            action: 'trip.start',
            resourceType: 'trip',
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Start trip failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleEndTripRequest = async (
    req: Request<{}, {}, EndTripInput['body']>,
    res: Response
) => {
    try {
        const trip = await endTripService(req.body)
        await createAuditLog({
            action: 'trip.end',
            resourceType: 'trip',
            resourceId: trip.id,
            actorId: res.locals.user?.id,
            message: 'Trip ended',
            success: true,
            req,
        })
        res.status(200).json(trip)
    } catch (e) {
        await createAuditLog({
            action: 'trip.end',
            resourceType: 'trip',
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'End trip failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}
