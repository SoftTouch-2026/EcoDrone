import { prisma } from '../utils/connect'
import {
    CreateDroneInput,
    UpdateDroneInput,
    DeleteDroneInput,
    GetDroneInput,
    GetDronesInput,
    AssignDroneInput,
} from '../utils/types'
import { DRONE_BATTERY_THRESHOLD } from '../utils/constants'
import { Decimal } from '@prisma/client/runtime/client'

export const createDroneService = async (data: CreateDroneInput['body']) => {
    try {
        const { serial_number, battery_level } = data
        const drone = await prisma.drones.create({
            data: {
                serial_number,
                battery_level,
            },
        })
        return drone
    } catch (e) {
        throw e
    }
}

export const updateDroneService = async (data: UpdateDroneInput['body']) => {
    try {
        const { serial_number, battery_level } = data
        const drone = await prisma.drones.update({
            where: {
                serial_number,
            },
            data: {
                battery_level,
            },
        })
        return drone
    } catch (e) {
        throw e
    }
}

export const deleteDroneService = async (data: DeleteDroneInput['params']) => {
    try {
        const { id } = data
        const drone = await prisma.drones.delete({
            where: {
                id,
            },
        })
        return drone
    } catch (e) {
        throw e
    }
}

export const getDroneService = async (data: GetDroneInput['params']) => {
    try {
        const { id } = data
        const drone = await prisma.drones.findUnique({
            where: {
                id,
            },
        })
        return drone
    } catch (e) {
        throw e
    }
}

export const getDronesService = async (data: GetDronesInput['params']) => {
    try {
        const { page, limit } = data
        const drones = await prisma.drones.findMany({
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        })
        return drones
    } catch (e) {
        throw e
    }
}

export const assignDroneService = async (data: AssignDroneInput['body']) => {
    try {
        const { drone_id, order_id } = data

        // Fetch and validate drone
        const drone = await prisma.drones.findUniqueOrThrow({
            where: {
                id: drone_id,
            },
        })

        // Fetch and validate order
        const order = await prisma.orders.findUniqueOrThrow({
            where: {
                id: order_id,
            },
        })

        // Validate drone availability
        if (drone.status !== 'available') {
            throw new Error('Drone is not available')
        }

        // Validate order status
        if (order?.status !== 'started') {
            throw new Error('Order is not started')
        }

        // Validate battery level
        if (
            (drone.battery_level as Decimal)?.toNumber() <
            DRONE_BATTERY_THRESHOLD
        ) {
            throw new Error('Drone battery is too low')
        }

        // Assign drone to order
        const updatedOrder = await prisma.orders.update({
            where: {
                id: order_id,
            },
            data: {
                assigned_drone: drone_id,
            },
        })

        return { drone, order: updatedOrder }
    } catch (e) {
        throw e
    }
}
