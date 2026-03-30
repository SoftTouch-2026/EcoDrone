import { prisma } from '../utils/connect'
import {
    VendorOrderDto,
    VendorOrderItemDto,
    VendorOrdersListResponse,
} from '../utils/types'

const orderStatusMap: Record<string, string> = {
    pending: 'Confirmed',
    started: 'In Transit',
    completed: 'Delivered',
    failed: 'Failed',
}

export async function getVendorMeService(vendorId: string) {
    const vendor = await prisma.vendors.findUnique({
        where: { id: vendorId },
        include: { locations: true },
    })
    return vendor
}

export async function getVendorMenuService(vendorId: string) {
    const items = await prisma.menu.findMany({
        where: { vendor_id: vendorId },
        orderBy: { created_at: 'desc' },
    })
    return items
}

export async function createVendorMenuItemService(
    vendorId: string,
    data: { name: string; unit_cost: number; description?: string; thumbnail?: string }
) {
    const menu = await prisma.menu.create({
        data: {
            name: data.name || '',
            unit_cost: data.unit_cost ?? 0,
            description: data.description ?? '',
            thumbnail_url: data.thumbnail ?? '',
            vendor_id: vendorId,
        },
    })
    return menu
}

export async function updateVendorMenuItemService(
    vendorId: string,
    id: string,
    data: { name: string; unit_cost: number; description?: string; thumbnail?: string }
) {
    const existing = await prisma.menu.findFirst({
        where: { id, vendor_id: vendorId },
    })
    if (!existing) return null
    const menu = await prisma.menu.update({
        where: { id },
        data: {
            name: data.name ?? existing.name,
            unit_cost: data.unit_cost ?? existing.unit_cost,
            description: data.description ?? existing.description ?? '',
            thumbnail_url: data.thumbnail ?? existing.thumbnail_url ?? '',
        },
    })
    return menu
}

export async function deleteVendorMenuItemService(vendorId: string, id: string) {
    const existing = await prisma.menu.findFirst({
        where: { id, vendor_id: vendorId },
    })
    if (!existing) return null
    const menu = await prisma.menu.delete({
        where: { id },
    })
    return menu
}

export async function getOrdersForVendorService(
    vendorId: string,
    query: { page?: string; limit?: string }
): Promise<VendorOrdersListResponse> {
    const page = Math.max(1, parseInt(query.page ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)))
    const skip = (page - 1) * limit

    const where = {
        order_item: {
            some: {
                menu: {
                    vendor_id: vendorId,
                },
            },
        },
    }

    const [orders, total] = await Promise.all([
        prisma.orders.findMany({
            where,
            orderBy: { created_at: 'desc' },
            skip,
            take: limit,
            include: {
                order_item: {
                    include: {
                        menu: true,
                    },
                },
                users: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                locations_orders_pickup_locationTolocations: true,
                locations_orders_dropoff_locationTolocations: true,
            },
        }),
        prisma.orders.count({ where }),
    ])

    const mapped: VendorOrderDto[] = orders.map((order) => {
        const pickup = order.locations_orders_pickup_locationTolocations
        const dropoff = order.locations_orders_dropoff_locationTolocations
        const customer = order.users
        const itemsForVendor = order.order_item.filter(
            (oi) => oi.menu?.vendor_id === vendorId
        )

        return {
            id: order.id,
            status: orderStatusMap[order.status ?? ''] ?? order.status,
            pickup_location: pickup
                ? { id: pickup.id, name: pickup.name }
                : { id: order.pickup_location, name: null },
            dropoff_location: dropoff
                ? { id: dropoff.id, name: dropoff.name }
                : { id: order.dropoff_location, name: null },
            customer: customer
                ? {
                      id: customer.id,
                      email: customer.email,
                      first_name: customer.first_name,
                      last_name: customer.last_name,
                  }
                : null,
            created_at: order.created_at,
            updated_at: order.updated_at,
            order_item: itemsForVendor.map<VendorOrderItemDto>((oi) => ({
                id: oi.id,
                order_id: oi.order_id,
                item_id: oi.item_id,
                order_quantity: oi.order_quantity,
                vendor_fulfilled_at: oi.vendor_fulfilled_at,
                menu: oi.menu
                    ? {
                          id: oi.menu.id,
                          name: oi.menu.name,
                          unit_cost: oi.menu.unit_cost,
                          thumbnail_url: oi.menu.thumbnail_url,
                      }
                    : null,
            })),
        }
    })

    return { data: mapped, total, page, limit }
}

export async function fulfillOrderItemsForVendorService(
    orderId: string,
    vendorId: string
) {
    const order = await prisma.orders.findUnique({
        where: { id: orderId },
        include: {
            order_item: {
                include: { menu: true },
            },
        },
    })
    if (!order) return { success: false, error: 'Order not found' as const }
    const vendorOrderItems = order.order_item.filter(
        (oi) => oi.menu?.vendor_id === vendorId
    )
    if (vendorOrderItems.length === 0) {
        return { success: false, error: 'No items for this vendor in order' as const }
    }
    const now = new Date()
    await prisma.order_item.updateMany({
        where: {
            id: { in: vendorOrderItems.map((oi) => oi.id) },
        },
        data: { vendor_fulfilled_at: now },
    })
    const updatedOrder = await prisma.orders.findUnique({
        where: { id: orderId },
        include: {
            order_item: { include: { menu: true } },
        },
    })
    return { success: true, order: updatedOrder }
}

export async function fulfillSingleOrderItemForVendorService(
    orderId: string,
    orderItemId: string,
    vendorId: string
) {
    const orderItem = await prisma.order_item.findFirst({
        where: {
            id: orderItemId,
            order_id: orderId,
        },
        include: {
            menu: true,
        },
    })

    if (!orderItem) {
        return { success: false, error: 'Order item not found' as const }
    }

    if (orderItem.menu?.vendor_id !== vendorId) {
        return {
            success: false,
            error: 'No items for this vendor in order' as const,
        }
    }

    const updated = await prisma.order_item.update({
        where: { id: orderItemId },
        data: { vendor_fulfilled_at: new Date() },
        include: { menu: true },
    })

    return { success: true, orderItem: updated }
}
