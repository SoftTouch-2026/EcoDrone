import { prisma } from '../utils/connect'
import {
    CreateOrderInput,
    UpdateOrderInput,
    DeleteOrderInput,
    GetOrderInput,
    GetOrdersInput,
} from '../utils/types'

export const createOrderService = async (data: CreateOrderInput['body']) => {
    try {
        const {
            pickup_location,
            dropoff_location,
            assigned_drone,
            customer_id,
        } = data
        const order = await prisma.orders.create({
            data: {
                pickup_location,
                dropoff_location,
                assigned_drone,
                customer_id,
            },
        })
        return order
    } catch (e) {
        throw e
    }
}

export const updateOrderService = async (data: UpdateOrderInput['body']) => {
    try {
        const {
            pickup_location,
            dropoff_location,
            assigned_drone,
            customer_id,
        } = data
        const order = await prisma.orders.update({
            where: {
                id: customer_id,
            },
            data: {
                pickup_location,
                dropoff_location,
                assigned_drone,
            },
        })
        return order
    } catch (e) {
        throw e
    }
}

export const deleteOrderService = async (data: DeleteOrderInput['params']) => {
    try {
        const { id } = data
        const order = await prisma.orders.delete({
            where: {
                id,
            },
        })
        return order
    } catch (e) {
        throw e
    }
}

export const getOrderService = async (data: GetOrderInput['params']) => {
    try {
        const { id } = data
        const order = await prisma.orders.findUnique({
            where: {
                id,
            },
        })
        return order
    } catch (e) {
        throw e
    }
}

export const getOrdersService = async (data: GetOrdersInput['params']) => {
    try {
        const { page, limit } = data
        const orders = await prisma.orders.findMany({
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        })
        return orders
    } catch (e) {
        throw e
    }
}

export const assignOrderService = async (data: any) => {
    try {
        const { order_id, drone_id } = data
        const order = await prisma.orders.update({
            where: {
                id: order_id,
            },
            data: {
                assigned_drone: drone_id,
            },
        })
        return order
    } catch (e) {
        throw e
    }
}
