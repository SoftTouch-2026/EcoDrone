import { prisma } from '../utils/connect'
import {
    CreateLocationInput,
    UpdateLocationInput,
    DeleteLocationInput,
    GetLocationInput,
    GetLocationsInput,
} from '../utils/types'

export const createLocationService = async (
    data: CreateLocationInput['body']
) => {
    try {
        const { name, latitude, longitude } = data
        const location = await prisma.locations.create({
            data: {
                name,
                latitude,
                longitude,
            },
        })
        return location
    } catch (e) {
        throw e
    }
}

export const updateLocationService = async (
    data: UpdateLocationInput['body']
) => {
    try {
        const { name, latitude, longitude, id } = data
        const location = await prisma.locations.update({
            where: {
                id: id,
            },
            data: {
                latitude,
                longitude,
            },
        })
        return location
    } catch (e) {
        throw e
    }
}

export const deleteLocationService = async (
    data: DeleteLocationInput['params']
) => {
    try {
        const { id } = data
        const location = await prisma.locations.delete({
            where: {
                id,
            },
        })
        return location
    } catch (e) {
        throw e
    }
}

export const getLocationService = async (data: GetLocationInput['params']) => {
    try {
        const { id } = data
        const location = await prisma.locations.findUnique({
            where: {
                id,
            },
        })
        return location
    } catch (e) {
        throw e
    }
}

export const getLocationsService = async (
    data: GetLocationsInput['params']
) => {
    try {
        const { page, limit } = data
        const locations = await prisma.locations.findMany({
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        })
        return locations
    } catch (e) {
        throw e
    }
}
