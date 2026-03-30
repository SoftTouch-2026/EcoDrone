import { prisma } from '../utils/connect'

export async function getCurrentReadingsService() {
    const drones = await prisma.drones.findMany({
        select: { id: true },
    })

    const readings = [
        {
            sensor: 'Temperature',
            current_value: '28.5',
            unit: '°C',
            range_min: '24.1',
            range_max: '32.8',
            status: 'normal',
        },
        {
            sensor: 'CO₂ (Carbon Dioxide)',
            current_value: '412',
            unit: 'ppm',
            range_min: '395',
            range_max: '438',
            status: 'normal',
        },
        {
            sensor: 'CO (Carbon Monoxide)',
            current_value: '0.4',
            unit: 'ppm',
            range_min: '0.2',
            range_max: '0.8',
            status: 'normal',
        },
    ]

    const readings_by_drone: Record<
        string,
        { temperature_c: number; co_ppm: number; co2_ppm: number; at: string }
    > = {}
    const now = new Date().toISOString()
    for (const d of drones) {
        readings_by_drone[d.id] = {
            temperature_c: 26 + Math.random() * 6,
            co_ppm: 0.2 + Math.random() * 0.6,
            co2_ppm: 395 + Math.random() * 50,
            at: now,
        }
    }

    return { readings, readings_by_drone }
}

export async function getFlightLogsService(query: {
    date_from?: string
    date_to?: string
    limit?: string
}) {
    const limit = Math.min(parseInt(query.limit || '50', 10), 100)
    const where: any = {}
    if (query.date_from && query.date_to) {
        where.start_time = {
            gte: new Date(query.date_from),
            lte: new Date(query.date_to),
        }
    }

    const trips = await prisma.trips.findMany({
        where,
        orderBy: { start_time: 'desc' },
        take: limit,
        include: {
            orders: {
                include: {
                    locations_orders_pickup_locationTolocations: {
                        select: { name: true },
                    },
                    locations_orders_dropoff_locationTolocations: {
                        select: { name: true },
                    },
                },
            },
        },
    })

    const droneIds = [
        ...new Set(
            trips
                .map((t) => t.orders?.assigned_drone)
                .filter(Boolean) as string[]
        ),
    ]
    const drones =
        droneIds.length > 0
            ? await prisma.drones.findMany({
                  where: { id: { in: droneIds } },
                  select: { id: true, serial_number: true },
              })
            : []
    const droneNameById = new Map(
        drones.map((d) => [d.id, d.serial_number ? `Drone ${d.serial_number}` : 'Drone'])
    )

    const data = trips.map((t) => {
        const order = t.orders
        const pickup = order?.locations_orders_pickup_locationTolocations?.name ?? 'Pickup'
        const dropoff = order?.locations_orders_dropoff_locationTolocations?.name ?? 'Dropoff'
        const droneName = order?.assigned_drone
            ? droneNameById.get(order.assigned_drone) ?? 'Drone'
            : '—'
        return {
            trip_id: t.id,
            order_id: order?.id ?? t.order_id,
            flight_id_display: `#ord-${(order?.id ?? t.order_id).slice(0, 8)}`,
            drone_name: droneName,
            route_display: `${pickup} → ${dropoff}`,
            date_time: (t.start_time ?? t.created_at).toISOString(),
            avg_temperature_c: 27 + Math.random() * 4,
            peak_temperature_c: 28 + Math.random() * 4,
            avg_co2_ppm: 400 + Math.random() * 50,
            peak_co2_ppm: 410 + Math.random() * 40,
            avg_co_ppm: 0.3 + Math.random() * 0.5,
            peak_co_ppm: 0.4 + Math.random() * 0.4,
        }
    })

    return { data }
}

export async function getTimeSeriesService(query: {
    sensor?: string
    date?: string
    resolution?: string
}) {
    const data = [
        { time: '00:00', value: 26.5 },
        { time: '03:00', value: 25.8 },
        { time: '06:00', value: 26.2 },
        { time: '09:00', value: 27.1 },
        { time: '12:00', value: 28.5 },
        { time: '15:00', value: 29.0 },
        { time: '18:00', value: 28.2 },
        { time: '21:00', value: 27.0 },
    ]
    return { data }
}
