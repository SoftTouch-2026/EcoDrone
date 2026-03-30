import * as z from 'zod'

export const CreateDronePayload = {
    body: z.object({
        serial_number: z.string().min(1),
        battery_level: z.number(),
    }),
}

export const UpdateDronePayload = {
    body: z.object({
        serial_number: z.string().min(1),
        battery_level: z.number(),
    }),
}

export const AssignDronePayload = {
    body: z.object({
        drone_id: z.string().min(1),
        order_id: z.string().min(1),
    }),
}

export const DeleteDroneParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetDroneParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetDronesQuery = {
    query: z.object({
        page: z.string().min(1).optional(),
        limit: z.string().min(1).optional(),
    }),
}

export const CreateDroneSchema = z.object({ ...CreateDronePayload })
export const UpdateDroneSchema = z.object({ ...UpdateDronePayload })
export const DeleteDroneSchema = z.object({ ...DeleteDroneParams })
export const GetDroneSchema = z.object({ ...GetDroneParams })
export const GetDronesSchema = z.object({ ...GetDronesQuery })
export const AssignDroneSchema = z.object({ ...AssignDronePayload })
