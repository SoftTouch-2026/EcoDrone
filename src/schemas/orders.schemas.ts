import * as z from 'zod'

export const CreateOrderPayload = {
    body: z.object({
        pickup_location: z.string().min(1),
        dropoff_location: z.string().min(1),
        assigned_drone: z.string().min(1).optional(),
        customer_id: z.string().min(1),
    }),
}

export const UpdateOrderPayload = {
    body: z.object({
        id: z.string().uuid(),
        pickup_location: z.string().min(1).optional(),
        dropoff_location: z.string().min(1).optional(),
        assigned_drone: z.string().min(1).optional(),
        customer_id: z.string().min(1).optional(),
    }),
}

export const DeleteOrderParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetOrderParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetOrdersQuery = {
    query: z.object({
        page: z.string().min(1).optional(),
        limit: z.string().min(1).optional(),
        user_id: z.string().min(1).optional(),
    }),
}

export const CreateOrderSchema = z.object({ ...CreateOrderPayload })
export const UpdateOrderSchema = z.object({ ...UpdateOrderPayload })
export const DeleteOrderSchema = z.object({ ...DeleteOrderParams })
export const GetOrderSchema = z.object({ ...GetOrderParams })
export const GetOrdersSchema = z.object({ ...GetOrdersQuery })
