import * as z from 'zod'

export const CreateOrderPayload = {
    body: z.object({
        pickup_location: z.string().min(1),
        dropoff_location: z.string().min(1),
        assigned_drone: z.string().min(1),
        customer_id: z.string().min(1),
    }),
}

export const UpdateOrderPayload = {
    body: z.object({
        pickup_location: z.string().min(1),
        dropoff_location: z.string().min(1),
        assigned_drone: z.string().min(1),
        customer_id: z.string().min(1),
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

export const GetOrdersParams = {
    params: z.object({
        page: z.string().min(1),
        limit: z.string().min(1),
    }),
}

export const CreateOrderSchema = z.object({ ...CreateOrderPayload })
export const UpdateOrderSchema = z.object({ ...UpdateOrderPayload })
export const DeleteOrderSchema = z.object({ ...DeleteOrderParams })
export const GetOrderSchema = z.object({ ...GetOrderParams })
export const GetOrdersSchema = z.object({ ...GetOrdersParams })
