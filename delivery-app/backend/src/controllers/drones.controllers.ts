import { Response, Request } from 'express'
import { sendError } from '../utils/errorResponse'
import {
    CreateDroneInput,
    UpdateDroneInput,
    DeleteDroneInput,
    GetDroneInput,
    GetDronesInput,
    AssignDroneInput,
} from '../utils/types'
import {
    createDroneService,
    updateDroneService,
    deleteDroneService,
    getDroneService,
    getDronesService,
    assignDroneService,
} from '../services/drones.service'
import { createAuditLog } from '../services/audit.service'

export const handleCreateDroneRequest = async (
    req: Request<{}, {}, CreateDroneInput['body']>,
    res: Response
) => {
    try {
        const drone = await createDroneService(req.body)
        await createAuditLog({
            action: 'drone.create',
            resourceType: 'drone',
            resourceId: drone.id,
            actorId: res.locals.user?.id,
            message: 'Drone created',
            success: true,
            req,
        })
        res.status(201).json(drone)
    } catch (e) {
        await createAuditLog({
            action: 'drone.create',
            resourceType: 'drone',
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Create drone failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleUpdateDroneRequest = async (
    req: Request<{}, {}, UpdateDroneInput['body']>,
    res: Response
) => {
    try {
        const drone = await updateDroneService(req.body)
        await createAuditLog({
            action: 'drone.update',
            resourceType: 'drone',
            resourceId: drone.id,
            actorId: res.locals.user?.id,
            message: 'Drone updated',
            success: true,
            req,
        })
        res.status(200).json(drone)
    } catch (e) {
        await createAuditLog({
            action: 'drone.update',
            resourceType: 'drone',
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Update drone failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleDeleteDroneRequest = async (
    req: Request<DeleteDroneInput['params'], {}, {}>,
    res: Response
) => {
    const id = req.params?.id
    try {
        const drone = await deleteDroneService(req.params)
        await createAuditLog({
            action: 'drone.delete',
            resourceType: 'drone',
            resourceId: id,
            actorId: res.locals.user?.id,
            message: 'Drone deleted',
            success: true,
            req,
        })
        res.status(200).json(drone)
    } catch (e) {
        await createAuditLog({
            action: 'drone.delete',
            resourceType: 'drone',
            resourceId: id,
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Delete drone failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleGetDroneRequest = async (
    req: Request<GetDroneInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const drone = await getDroneService(req.params)
        res.status(200).json(drone)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleGetDronesRequest = async (
    req: Request<{}, {}, {}, GetDronesInput['query']>,
    res: Response
) => {
    try {
        const drones = await getDronesService(req.query)
        res.status(200).json(drones)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleAssignDroneRequest = async (
    req: Request<{}, {}, AssignDroneInput['body']>,
    res: Response
) => {
    try {
        const result = await assignDroneService(req.body)
        await createAuditLog({
            action: 'drone.assign',
            resourceType: 'drone',
            resourceId: req.body.drone_id,
            actorId: res.locals.user?.id,
            message: 'Drone assigned to order',
            metadata: { order_id: req.body.order_id },
            success: true,
            req,
        })
        res.status(200).json(result)
    } catch (e) {
        await createAuditLog({
            action: 'drone.assign',
            resourceType: 'drone',
            resourceId: req.body?.drone_id,
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Assign drone failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}
