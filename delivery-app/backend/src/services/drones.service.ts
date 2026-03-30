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

const droneStatusMap: Record<string, string> = {
    available: 'Idle',
    pending: 'Assigned',
}

function mapDroneToSpec(drone: {
    id: string
    serial_number: string | null
    battery_level: Decimal | null
    status: string | null
    created_at: Date
    updated_at: Date
}, current_order_id?: string | null) {
    const battery = drone.battery_level != null ? Number(drone.battery_level) : null
    return {
        id: drone.id,
        serial_number: drone.serial_number ?? '',
        name: drone.serial_number ? `Drone ${drone.serial_number}` : 'Drone',
        battery_level: battery ?? 0,
        status: droneStatusMap[drone.status ?? ''] ?? 'Idle',
        current_order_id: current_order_id ?? null,
        latitude: null as number | null,
        longitude: null as number | null,
        total_flights: 0,
        last_active_at: null as string | null,
        speed_kmh: null as number | null,
        created_at: drone.created_at,
        updated_at: drone.updated_at,
    }
}

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
            where: { id },
        })
        if (!drone) return null
        const order = await prisma.orders.findFirst({
            where: { assigned_drone: id },
            select: { id: true },
        })
        return mapDroneToSpec(drone, order?.id)
    } catch (e) {
        throw e
    }
}

export const getDronesService = async (data: GetDronesInput['query']) => {
    try {
        const page = parseInt(data.page || '1', 10)
        const limit = parseInt(data.limit || '10', 10)
        const skip = (page - 1) * limit
        const where = {}
        const [drones, total] = await Promise.all([
            prisma.drones.findMany({
                where,
                skip,
                take: limit,
            }),
            prisma.drones.count({ where }),
        ])
        const droneIds = drones.map((d) => d.id)
        const ordersWithDrone = await prisma.orders.findMany({
            where: { assigned_drone: { in: droneIds } },
            select: { id: true, assigned_drone: true },
        })
        const orderByDrone = new Map(
            ordersWithDrone.map((o) => [o.assigned_drone, o.id])
        )
        const list = drones.map((d) =>
            mapDroneToSpec(d, orderByDrone.get(d.id) ?? null)
        )
        return { data: list, total, page, limit }
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
