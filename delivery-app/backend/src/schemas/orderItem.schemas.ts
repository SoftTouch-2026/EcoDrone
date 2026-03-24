import * as z from 'zod'

export const CreateOrderItemPayload = {
    body: z.object({
        order_id: z.string().min(1),
        item_id: z.string().min(1),
        order_quantity: z.number().int().positive(),
    }),
}

export const UpdateOrderItemPayload = {
    body: z.object({
        id: z.string().min(1),
        order_quantity: z.number().int().positive(),
    }),
}

export const DeleteOrderItemParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetOrderItemsParams = {
    params: z.object({
        order_id: z.string().min(1),
    }),
}

export const CreateOrderItemSchema = z.object({ ...CreateOrderItemPayload })
export const UpdateOrderItemSchema = z.object({ ...UpdateOrderItemPayload })
export const DeleteOrderItemSchema = z.object({ ...DeleteOrderItemParams })
export const GetOrderItemsSchema = z.object({ ...GetOrderItemsParams })
