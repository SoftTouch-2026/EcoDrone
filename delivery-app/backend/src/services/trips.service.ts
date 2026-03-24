import { prisma } from '../utils/connect'
import {
    CreateTripInput,
    UpdateTripInput,
    DeleteTripInput,
    GetTripInput,
    GetTripsInput,
    StartTripInput,
    EndTripInput,
} from '../utils/types'

export const createTripService = async (data: CreateTripInput['body']) => {
    try {
        const { order_id, status } = data
        const trip = await prisma.trips.create({
            data: {
                order_id,
                status,
            },
        })
        return trip
    } catch (e) {
        throw e
    }
}

export const updateTripService = async (data: UpdateTripInput['body']) => {
    try {
        const { trip_id, status } = data
        const trip = await prisma.trips.update({
            where: {
                id: trip_id,
            },
            data: {
                status,
            },
        })
        return trip
    } catch (e) {
        throw e
    }
}

export const deleteTripService = async (data: DeleteTripInput['params']) => {
    try {
        const { id } = data
        const trip = await prisma.trips.delete({
            where: {
                id,
            },
        })
        return trip
    } catch (e) {
        throw e
    }
}

export const getTripService = async (data: GetTripInput['params']) => {
    try {
        const { id } = data
        const trip = await prisma.trips.findUnique({
            where: {
                id,
            },
        })
        return trip
    } catch (e) {
        throw e
    }
}

export const getTripsService = async (data: GetTripsInput['params']) => {
    try {
        const { page, limit } = data
        const trips = await prisma.trips.findMany({
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        })
        return trips
    } catch (e) {
        throw e
    }
}

export const startTripService = async (data: StartTripInput['body']) => {
    try {
        const { trip_id } = data
        const trip = await prisma.trips.update({
            where: {
                id: trip_id,
            },
            data: {
                status: 'ongoing',
                start_time: new Date(),
            },
        })
        return trip
    } catch (e) {
        throw e
    }
}

export const endTripService = async (data: EndTripInput['body']) => {
    try {
        const { trip_id } = data
        const trip = await prisma.trips.update({
            where: {
                id: trip_id,
            },
            data: {
                status: 'completed',
                end_time: new Date(),
            },
        })
        return trip
    } catch (e) {
        throw e
    }
}
