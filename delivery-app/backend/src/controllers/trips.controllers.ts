import { Request, Response } from 'express'
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

export const handleCreateTripRequest = async (
    req: Request<{}, {}, CreateTripInput['body']>,
    res: Response
) => {
    try {
        const trip = await createTripService(req.body)
        res.status(201).json(trip)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleUpdateTripRequest = async (
    req: Request<{}, {}, UpdateTripInput['body']>,
    res: Response
) => {
    try {
        const trip = await updateTripService(req.body)
        res.status(200).json(trip)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleDeleteTripRequest = async (
    req: Request<DeleteTripInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const trip = await deleteTripService(req.params)
        res.status(200).json(trip)
    } catch (e) {
        res.status(400).send(e)
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
        res.status(400).send(e)
    }
}

export const handleGetTripsRequest = async (
    req: Request<GetTripsInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const trips = await getTripsService(req.params)
        res.status(200).json(trips)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleStartTripRequest = async (
    req: Request<{}, {}, StartTripInput['body']>,
    res: Response
) => {
    try {
        const trip = await startTripService(req.body)
        res.status(200).json(trip)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleEndTripRequest = async (
    req: Request<{}, {}, EndTripInput['body']>,
    res: Response
) => {
    try {
        const trip = await endTripService(req.body)
        res.status(200).json(trip)
    } catch (e) {
        res.status(400).send(e)
    }
}
