import { prisma } from '../utils/connect'
import { Decimal } from '@prisma/client/runtime/client'

function startOfToday() {
    const d = new Date()
    d.setUTCHours(0, 0, 0, 0)
    return d
}

function endOfToday() {
    const d = new Date()
    d.setUTCHours(23, 59, 59, 999)
    return d
}

function parseDateRange(date_from?: string, date_to?: string, period?: string) {
    let from: Date
    let to: Date = new Date()
    if (period === 'this_week') {
        to = new Date()
        from = new Date(to)
        from.setDate(from.getDate() - 7)
    } else if (period === 'this_month') {
        to = new Date()
        from = new Date(to.getFullYear(), to.getMonth(), 1)
    } else if (date_from && date_to) {
        from = new Date(date_from)
        to = new Date(date_to)
    } else {
        from = new Date(to)
        from.setDate(from.getDate() - 30)
    }
    return { from, to }
}

export async function getDashboardSummaryService() {
    const todayStart = startOfToday()
    const todayEnd = endOfToday()

    const [
        activeDeliveriesCount,
        dronesTotal,
        dronesOperational,
        ordersTodayCount,
        tripsCompletedToday,
        ordersToday,
    ] = await Promise.all([
        prisma.orders.count({
            where: { status: 'started' },
        }),
        prisma.drones.count(),
        prisma.drones.count({ where: { status: 'available' } }),
        prisma.orders.count({
            where: {
                created_at: { gte: todayStart, lte: todayEnd },
            },
        }),
        prisma.trips.findMany({
            where: {
                status: 'completed',
                end_time: { gte: todayStart, lte: todayEnd },
            },
            select: { start_time: true, end_time: true },
        }),
        prisma.orders.findMany({
            where: {
                created_at: { gte: todayStart, lte: todayEnd },
            },
            select: { created_at: true },
        }),
    ])

    let avg_delivery_time_minutes = 0
    if (tripsCompletedToday.length > 0) {
        const totalMs = tripsCompletedToday.reduce((acc, t) => {
            if (t.start_time && t.end_time)
                return acc + (t.end_time.getTime() - t.start_time.getTime())
            return acc
        }, 0)
        avg_delivery_time_minutes = Math.round(
            totalMs / tripsCompletedToday.length / 60000 * 10
        ) / 10
    }

    const hourCounts: Record<number, number> = {}
    for (let h = 0; h < 24; h++) hourCounts[h] = 0
    for (const o of ordersToday) {
        const h = o.created_at.getUTCHours()
        hourCounts[h] = (hourCounts[h] || 0) + 1
    }
    const hourly_orders_today = Object.entries(hourCounts).map(
        ([hour, orders]) => ({
            hour: `${parseInt(hour, 10) === 0 ? '12' : parseInt(hour, 10) > 12 ? parseInt(hour, 10) - 12 : parseInt(hour, 10)} ${parseInt(hour, 10) < 12 ? 'AM' : 'PM'}`,
            orders,
        })
    )

    return {
        active_deliveries_count: activeDeliveriesCount,
        drones_operational_count: dronesOperational,
        drones_total_count: dronesTotal,
        orders_today_count: ordersTodayCount,
        avg_delivery_time_minutes,
        hourly_orders_today,
    }
}

export async function getActivityService(limit?: string) {
    const take = Math.min(parseInt(limit || '20', 10), 50)
    const [orders, trips] = await Promise.all([
        prisma.orders.findMany({
            orderBy: { created_at: 'desc' },
            take: take * 2,
            include: {
                locations_orders_pickup_locationTolocations: {
                    select: { name: true },
                },
                locations_orders_dropoff_locationTolocations: {
                    select: { name: true },
                },
            },
        }),
        prisma.trips.findMany({
            orderBy: { updated_at: 'desc' },
            take: take * 2,
            select: {
                id: true,
                order_id: true,
                status: true,
                start_time: true,
                end_time: true,
                updated_at: true,
            },
        }),
    ])

    const items: { time: string; type: string; message: string; at: Date }[] = []

    for (const o of orders) {
        const t = o.created_at
        const timeStr = `${t.getUTCHours().toString().padStart(2, '0')}:${t.getUTCMinutes().toString().padStart(2, '0')}`
        const pickup = o.locations_orders_pickup_locationTolocations?.name ?? 'Pickup'
        const dropoff = o.locations_orders_dropoff_locationTolocations?.name ?? 'Dropoff'
        items.push({
            at: o.created_at,
            time: timeStr,
            type: 'new_order',
            message: `New order: #${o.id.slice(0, 8)} → ${dropoff}`,
        })
        if (o.assigned_drone) {
            items.push({
                at: o.created_at,
                time: timeStr,
                type: 'drone_assigned',
                message: `Drone assigned to order #${o.id.slice(0, 8)}`,
            })
        }
    }

    for (const tr of trips) {
        const t = (tr.end_time ?? tr.updated_at) ?? new Date()
        const timeStr = `${t.getUTCHours().toString().padStart(2, '0')}:${t.getUTCMinutes().toString().padStart(2, '0')}`
        if (tr.status === 'completed') {
            items.push({
                at: t,
                time: timeStr,
                type: 'order_delivered',
                message: `Order #${tr.order_id.slice(0, 8)} delivered`,
            })
        }
    }

    items.sort((a, b) => b.at.getTime() - a.at.getTime())
    return {
        items: items.slice(0, take).map(({ time, type, message }) => ({
            time,
            type,
            message,
        })),
    }
}

export async function getVendorPerformanceService(query: {
    date_from?: string
    date_to?: string
    period?: string
}) {
    const { from, to } = parseDateRange(
        query.date_from,
        query.date_to,
        query.period
    )

    const orderItems = await prisma.order_item.findMany({
        where: {
            orders: {
                created_at: { gte: from, lte: to },
            },
        },
        include: {
            menu: { include: { vendors: true } },
            orders: {
                select: { id: true },
                include: {
                    trips: {
                        where: { status: 'completed' },
                        select: { start_time: true, end_time: true },
                    },
                },
            },
        },
    })

    const byVendor: Record<
        string,
        {
            vendor_id: string
            vendor_name: string
            order_ids: Set<string>
            items_delivered_count: number
            revenue: number
            delivery_times_ms: number[]
        }
    > = {}

    for (const oi of orderItems) {
        const vendor = oi.menu?.vendors
        if (!vendor) continue
        const vid = vendor.id
        if (!byVendor[vid]) {
            byVendor[vid] = {
                vendor_id: vid,
                vendor_name: vendor.name,
                order_ids: new Set(),
                items_delivered_count: 0,
                revenue: 0,
                delivery_times_ms: [],
            }
        }
        if (oi.order_id) byVendor[vid].order_ids.add(oi.order_id)
        const qty = oi.order_quantity ?? 0
        const cost = oi.menu?.unit_cost
            ? Number(oi.menu.unit_cost as Decimal)
            : 0
        byVendor[vid].items_delivered_count += qty
        byVendor[vid].revenue += qty * cost
        const trip = oi.orders?.trips?.[0]
        if (trip?.start_time && trip?.end_time) {
            byVendor[vid].delivery_times_ms.push(
                trip.end_time.getTime() - trip.start_time.getTime()
            )
        }
    }

    const data = Object.values(byVendor).map((v) => {
        const avgDeliveryMs =
            v.delivery_times_ms.length > 0
                ? v.delivery_times_ms.reduce((a, b) => a + b, 0) /
                  v.delivery_times_ms.length
                : 0
        return {
            vendor_id: v.vendor_id,
            vendor_name: v.vendor_name,
            orders_count: v.order_ids.size,
            items_delivered_count: v.items_delivered_count,
            revenue: Math.round(v.revenue * 100) / 100,
            avg_delivery_time_minutes: Math.round(
                (avgDeliveryMs / 60000) * 10
            ) / 10,
        }
    })

    return { data }
}

export async function getDronePerformanceService(query: {
    date_from?: string
    date_to?: string
    period?: string
}) {
    const { from, to } = parseDateRange(
        query.date_from,
        query.date_to,
        query.period
    )

    const trips = await prisma.trips.findMany({
        where: {
            status: 'completed',
            end_time: { gte: from, lte: to },
        },
        include: {
            orders: { select: { assigned_drone: true } },
        },
    })

    const drones = await prisma.drones.findMany({
        select: { id: true, serial_number: true, battery_level: true },
    })

    const byDrone: Record<
        string,
        {
            drone_id: string
            drone_name: string
            flights_count: number
            flight_time_hours: number
            avg_battery_at_landing_percent: number
            groundings_count: number
        }
    > = {}

    for (const d of drones) {
        byDrone[d.id] = {
            drone_id: d.id,
            drone_name: d.serial_number ? `Drone ${d.serial_number}` : 'Drone',
            flights_count: 0,
            flight_time_hours: 0,
            avg_battery_at_landing_percent: 0,
            groundings_count: 0,
        }
    }

    for (const t of trips) {
        const droneId = t.orders?.assigned_drone
        if (!droneId || !byDrone[droneId]) continue
        byDrone[droneId].flights_count += 1
        if (t.start_time && t.end_time) {
            byDrone[droneId].flight_time_hours +=
                (t.end_time.getTime() - t.start_time.getTime()) / 3600000
        }
    }

    const data = Object.values(byDrone).map((v) => ({
        ...v,
        flight_time_hours: Math.round(v.flight_time_hours * 100) / 100,
        avg_battery_at_landing_percent: v.avg_battery_at_landing_percent || 0,
    }))

    return { data }
}

export async function getDeliveryLocationsService(query: {
    date_from?: string
    date_to?: string
    period?: string
}) {
    const { from, to } = parseDateRange(
        query.date_from,
        query.date_to,
        query.period
    )

    const orders = await prisma.orders.findMany({
        where: { created_at: { gte: from, lte: to } },
        select: { dropoff_location: true },
    })

    const locationIds = [...new Set(orders.map((o) => o.dropoff_location))]
    const locations = await prisma.locations.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true },
    })
    const nameById = new Map(locations.map((l) => [l.id, l.name ?? l.id]))

    const countByLocation: Record<string, number> = {}
    for (const o of orders) {
        countByLocation[o.dropoff_location] =
            (countByLocation[o.dropoff_location] ?? 0) + 1
    }
    const total = orders.length
    const data = Object.entries(countByLocation).map(([location_id, orders_count]) => ({
        location_id,
        location_name: nameById.get(location_id) ?? location_id,
        orders_count,
        percentage: total > 0 ? Math.round((orders_count / total) * 100) : 0,
    }))

    return { data }
}

export async function getUserActivityService(query: {
    date_from?: string
    date_to?: string
    limit?: string
}) {
    const { from, to } = parseDateRange(
        query.date_from,
        query.date_to,
        undefined
    )
    const take = Math.min(parseInt(query.limit || '50', 10), 100)

    const orders = await prisma.orders.findMany({
        where: { created_at: { gte: from, lte: to } },
        orderBy: { created_at: 'desc' },
        take,
        include: {
            users: { select: { id: true, email: true, first_name: true, last_name: true } },
        },
    })

    const items = orders.map((o) => ({
        time: `${o.created_at.getUTCHours().toString().padStart(2, '0')}:${o.created_at.getUTCMinutes().toString().padStart(2, '0')}`,
        type: 'order_placed',
        user_id: o.customer_id,
        user_email: o.users?.email,
        message: `Order #${o.id.slice(0, 8)} placed`,
    }))

    return { items }
}

export async function getHourlyOrdersService(query: {
    date?: string
    date_from?: string
    date_to?: string
}) {
    let from: Date
    let to: Date
    if (query.date) {
        from = new Date(query.date)
        from.setUTCHours(0, 0, 0, 0)
        to = new Date(from)
        to.setUTCDate(to.getUTCDate() + 1)
    } else if (query.date_from && query.date_to) {
        from = new Date(query.date_from)
        to = new Date(query.date_to)
    } else {
        from = startOfToday()
        to = endOfToday()
    }

    const orders = await prisma.orders.findMany({
        where: { created_at: { gte: from, lt: to } },
        select: { created_at: true },
    })

    const hourCounts: Record<number, number> = {}
    for (let h = 0; h < 24; h++) hourCounts[h] = 0
    for (const o of orders) {
        const h = o.created_at.getUTCHours()
        hourCounts[h] = (hourCounts[h] || 0) + 1
    }
    const data = Object.entries(hourCounts).map(([hour, orders]) => ({
        hour: `${parseInt(hour, 10)}:00`,
        orders,
    }))

    return { data }
}
