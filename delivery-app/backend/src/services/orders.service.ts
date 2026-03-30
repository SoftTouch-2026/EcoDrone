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
            // assigned_drone,
            customer_id,
        } = data
        const order = await prisma.orders.create({
            data: {
                pickup_location,
                dropoff_location,
                customer_id,
                status: 'pending',
            },
        })
        return order
    } catch (e) {
        throw e
    }
}

export const updateOrderService = async (data: UpdateOrderInput['body']) => {
    try {
        const { id, ...rest } = data
        const updateData: {
            pickup_location?: string
            dropoff_location?: string
            assigned_drone?: string | null
            customer_id?: string
        } = {}
        if (rest.pickup_location !== undefined)
            updateData.pickup_location = rest.pickup_location
        if (rest.dropoff_location !== undefined)
            updateData.dropoff_location = rest.dropoff_location
        if (rest.assigned_drone !== undefined)
            updateData.assigned_drone = rest.assigned_drone
        if (rest.customer_id !== undefined)
            updateData.customer_id = rest.customer_id
        const order = await prisma.orders.update({
            where: { id },
            data: updateData,
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

const orderStatusMap: Record<string, string> = {
    pending: 'Confirmed',
    started: 'In Transit',
    completed: 'Delivered',
    failed: 'Failed',
}

function mapOrderToSpec(order: any) {
    const pickup = order.locations_orders_pickup_locationTolocations
    const dropoff = order.locations_orders_dropoff_locationTolocations
    const customer = order.users
    const firstItem = order.order_item?.[0]
    const vendor = firstItem?.menu?.vendors ?? null
    return {
        id: order.id,
        status: orderStatusMap[order.status ?? ''] ?? order.status,
        pickup_location: pickup
            ? { id: pickup.id, name: pickup.name }
            : order.pickup_location,
        dropoff_location: dropoff
            ? { id: dropoff.id, name: dropoff.name }
            : order.dropoff_location,
        assigned_drone_id: order.assigned_drone,
        customer_id: order.customer_id,
        customer: customer
            ? {
                  id: customer.id,
                  email: customer.email,
                  first_name: customer.first_name,
                  last_name: customer.last_name,
              }
            : null,
        vendor: vendor ? { id: vendor.id, name: vendor.name } : null,
        created_at: order.created_at,
        completed_at: null as string | null,
        duration_minutes: null as number | null,
        order_item: order.order_item,
    }
}

export const getOrderService = async (data: GetOrderInput['params']) => {
    try {
        const { id } = data
        const order = await prisma.orders.findUnique({
            where: { id },
            include: {
                order_item: {
                    include: {
                        menu: { include: { vendors: true } },
                    },
                },
                users: true,
                locations_orders_pickup_locationTolocations: true,
                locations_orders_dropoff_locationTolocations: true,
            },
        })
        if (!order) return null
        return mapOrderToSpec(order)
    } catch (e) {
        throw e
    }
}

export const getOrdersService = async (data: GetOrdersInput['query']) => {
    try {
        const page = parseInt(data.page || '1', 10)
        const limit = parseInt(data.limit || '10', 10)
        const skip = (page - 1) * limit
        const where = {
            ...(data.user_id ? { customer_id: data.user_id } : {}),
        }
        const [ordersRaw, total] = await Promise.all([
            prisma.orders.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    order_item: {
                        include: {
                            menu: { include: { vendors: true } },
                        },
                    },
                    users: true,
                    locations_orders_pickup_locationTolocations: true,
                    locations_orders_dropoff_locationTolocations: true,
                },
            }),
            prisma.orders.count({ where }),
        ])
        const list = ordersRaw.map(mapOrderToSpec)
        return { data: list, total, page, limit }
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
