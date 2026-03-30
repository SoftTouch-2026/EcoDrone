import { Request, Response } from 'express'
import { sendError } from '../utils/errorResponse'
import {
    CreateLocationInput,
    UpdateLocationInput,
    DeleteLocationInput,
    GetLocationInput,
    GetLocationsInput,
} from '../utils/types'
import {
    createLocationService,
    updateLocationService,
    deleteLocationService,
    getLocationService,
    getLocationsService,
} from '../services/locations.service'

export const handleCreateLocationRequest = async (
    req: Request<{}, {}, CreateLocationInput['body']>,
    res: Response
) => {
    try {
        const location = await createLocationService(req.body)
        res.status(201).json(location)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleUpdateLocationRequest = async (
    req: Request<{}, {}, UpdateLocationInput['body']>,
    res: Response
) => {
    try {
        const location = await updateLocationService(req.body)
        res.status(200).json(location)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleDeleteLocationRequest = async (
    req: Request<DeleteLocationInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const location = await deleteLocationService(req.params)
        res.status(200).json(location)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleGetLocationRequest = async (
    req: Request<GetLocationInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const location = await getLocationService(req.params)
        res.status(200).json(location)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleGetLocationsRequest = async (
    req: Request<{}, {}, {}, GetLocationsInput['query']>,
    res: Response
) => {
    try {
        const locations = await getLocationsService(req.query)
        res.status(200).json(locations)
    } catch (e) {
        return sendError(res, 400, e)
    }
}
