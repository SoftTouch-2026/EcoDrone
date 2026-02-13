import { Response, Request } from 'express'
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

export const handleCreateDroneRequest = async (
    req: Request<{}, {}, CreateDroneInput['body']>,
    res: Response
) => {
    try {
        const drone = await createDroneService(req.body)
        res.status(201).json(drone)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleUpdateDroneRequest = async (
    req: Request<{}, {}, UpdateDroneInput['body']>,
    res: Response
) => {
    try {
        const drone = await updateDroneService(req.body)
        res.status(200).json(drone)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleDeleteDroneRequest = async (
    req: Request<DeleteDroneInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const drone = await deleteDroneService(req.params)
        res.status(200).json(drone)
    } catch (e) {
        res.status(400).send(e)
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
        res.status(400).send(e)
    }
}

export const handleGetDronesRequest = async (
    req: Request<GetDronesInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const drones = await getDronesService(req.params)
        res.status(200).json(drones)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleAssignDroneRequest = async (
    req: Request<{}, {}, AssignDroneInput['body']>,
    res: Response
) => {
    try {
        const result = await assignDroneService(req.body)
        res.status(200).json(result)
    } catch (e) {
        res.status(400).send(e)
    }
}
