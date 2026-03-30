import * as z from 'zod'

export const CurrentReadingsQuery = {
    query: z.object({}),
}

export const FlightLogsQuery = {
    query: z.object({
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        limit: z.string().optional(),
    }),
}

export const TimeSeriesQuery = {
    query: z.object({
        sensor: z.enum(['temperature', 'co2', 'co']).optional(),
        date: z.string().optional(),
        resolution: z.string().optional(),
    }),
}

export const CurrentReadingsSchema = z.object({ ...CurrentReadingsQuery })
export const FlightLogsSchema = z.object({ ...FlightLogsQuery })
export const TimeSeriesSchema = z.object({ ...TimeSeriesQuery })
