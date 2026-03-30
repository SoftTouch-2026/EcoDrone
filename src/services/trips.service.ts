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

function mapTripToSpec(trip: any) {
    const order = trip.orders
    return {
        id: trip.id,
        order_id: trip.order_id,
        status: trip.status,
        start_time: trip.start_time,
        end_time: trip.end_time,
        drone_id: order?.assigned_drone ?? null,
        pickup_location_id: order?.pickup_location ?? null,
        dropoff_location_id: order?.dropoff_location ?? null,
        created_at: trip.created_at,
        updated_at: trip.updated_at,
    }
}

export const getTripService = async (data: GetTripInput['params']) => {
    try {
        const { id } = data
        const trip = await prisma.trips.findUnique({
            where: { id },
            include: {
                orders: {
                    select: {
                        assigned_drone: true,
                        pickup_location: true,
                        dropoff_location: true,
                    },
                },
            },
        })
        if (!trip) return null
        return mapTripToSpec(trip)
    } catch (e) {
        throw e
    }
}

export const getTripsService = async (data: GetTripsInput['query']) => {
    try {
        const page = parseInt(data.page || '1', 10)
        const limit = parseInt(data.limit || '10', 10)
        const skip = (page - 1) * limit
        const where = {}
        const [tripsRaw, total] = await Promise.all([
            prisma.trips.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    orders: {
                        select: {
                            assigned_drone: true,
                            pickup_location: true,
                            dropoff_location: true,
                        },
                    },
                },
            }),
            prisma.trips.count({ where }),
        ])
        const list = tripsRaw.map(mapTripToSpec)
        return { data: list, total, page, limit }
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
