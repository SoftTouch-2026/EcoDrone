import * as z from 'zod'

// ─── Flight Commands ────────────────────────────────────────

export const CreateFlightCommandPayload = {
    body: z.object({
        drone_id: z.string().uuid(),
        origin_latitude: z.number(),
        origin_longitude: z.number(),
        dest_latitude: z.number(),
        dest_longitude: z.number(),
        altitude: z.number().positive(),
        scheduled_time: z.string().datetime(),
    }),
}

export const GetPendingCommandsParams = {
    params: z.object({
        drone_id: z.string().uuid(),
    }),
}

export const AcknowledgeCommandPayload = {
    body: z.object({
        command_id: z.string().uuid(),
        status: z.enum([
            'acknowledged',
            'in_progress',
            'completed',
            'failed',
            'cancelled',
        ]),
    }),
}

// ─── Drone Telemetry ────────────────────────────────────────

export const ReportTelemetryPayload = {
    body: z.object({
        drone_id: z.string().uuid(),
        latitude: z.number(),
        longitude: z.number(),
        altitude: z.number(),
        battery_level: z.number().min(0).max(100),
        drone_state: z.string().min(1),
        speed: z.number().optional(),
        heading: z.number().optional(),
        eta_seconds: z.number().int().optional(),
    }),
}

export const GetLatestTelemetryParams = {
    params: z.object({
        drone_id: z.string().uuid(),
    }),
}

// ─── Composed Schemas ───────────────────────────────────────

export const CreateFlightCommandSchema = z.object({
    ...CreateFlightCommandPayload,
})
export const GetPendingCommandsSchema = z.object({
    ...GetPendingCommandsParams,
})
export const AcknowledgeCommandSchema = z.object({
    ...AcknowledgeCommandPayload,
})
export const ReportTelemetrySchema = z.object({
    ...ReportTelemetryPayload,
})
export const GetLatestTelemetrySchema = z.object({
    ...GetLatestTelemetryParams,
})
