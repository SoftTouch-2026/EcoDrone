import { Request, Response } from 'express'
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
        res.status(400).send(e)
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
        res.status(400).send(e)
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
        res.status(400).send(e)
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
        res.status(400).send(e)
    }
}

export const handleGetLocationsRequest = async (
    req: Request<GetLocationsInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const locations = await getLocationsService(req.params)
        res.status(200).json(locations)
    } catch (e) {
        res.status(400).send(e)
    }
}
