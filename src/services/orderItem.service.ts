import { prisma } from '../utils/connect'
import {
    CreateOrderItemInput,
    UpdateOrderItemInput,
    DeleteOrderItemInput,
    GetOrderItemsInput,
} from '../utils/types'

export const createOrderItemService = async (
    data: CreateOrderItemInput['body']
) => {
    try {
        const { order_id, item_id, order_quantity } = data
        const orderItem = await prisma.order_item.create({
            data: {
                order_id,
                item_id,
                order_quantity,
            },
        })
        return orderItem
    } catch (e) {
        throw e
    }
}

export const updateOrderItemService = async (
    data: UpdateOrderItemInput['body']
) => {
    try {
        const { id, order_quantity } = data
        const orderItem = await prisma.order_item.update({
            where: {
                id,
            },
            data: {
                order_quantity,
            },
        })
        return orderItem
    } catch (e) {
        throw e
    }
}

export const deleteOrderItemService = async (
    data: DeleteOrderItemInput['params']
) => {
    try {
        const { id } = data
        const orderItem = await prisma.order_item.delete({
            where: {
                id,
            },
        })
        return orderItem
    } catch (e) {
        throw e
    }
}

export const getOrderItemsService = async (
    data: GetOrderItemsInput['params']
) => {
    try {
        const { order_id } = data
        const orderItems = await prisma.order_item.findMany({
            where: {
                order_id,
            },
            include: {
                menu: true,
            },
        })
        return orderItems
    } catch (e) {
        throw e
    }
}
