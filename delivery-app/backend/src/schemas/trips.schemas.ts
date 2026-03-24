import * as z from 'zod'

export const CreateTripPayload = {
    body: z.object({
        order_id: z.string().min(1),
        status: z.enum(['ongoing', 'completed', 'created', 'cancelled']),
    }),
}

export const StartTripPayload = {
    body: z.object({
        trip_id: z.string().min(1),
    }),
}

export const EndTripPayload = {
    body: z.object({
        trip_id: z.string().min(1),
    }),
}

export const UpdateTripPayload = {
    body: z.object({
        trip_id: z.string().min(1),
        status: z.enum(['ongoing', 'completed', 'created', 'cancelled']),
    }),
}

export const DeleteTripParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetTripParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetTripsParams = {
    params: z.object({
        page: z.string().min(1),
        limit: z.string().min(1),
    }),
}

export const CreateTripSchema = z.object({ ...CreateTripPayload })
export const StartTripSchema = z.object({ ...StartTripPayload })
export const EndTripSchema = z.object({ ...EndTripPayload })
export const UpdateTripSchema = z.object({ ...UpdateTripPayload })
export const DeleteTripSchema = z.object({ ...DeleteTripParams })
export const GetTripSchema = z.object({ ...GetTripParams })
export const GetTripsSchema = z.object({ ...GetTripsParams })
