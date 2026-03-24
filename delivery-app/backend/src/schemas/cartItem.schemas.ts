import * as z from 'zod'

export const AddCartItemPayload = {
    body: z.object({
        cart_id: z.string().min(1),
        item_id: z.string().min(1),
        quantity: z.number().int().positive(),
    }),
}

export const UpdateCartItemPayload = {
    body: z.object({
        id: z.string().min(1),
        quantity: z.number().int().positive(),
    }),
}

export const DeleteCartItemParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetCartItemsParams = {
    params: z.object({
        cart_id: z.string().min(1),
    }),
}

export const AddCartItemSchema = z.object({ ...AddCartItemPayload })
export const UpdateCartItemSchema = z.object({ ...UpdateCartItemPayload })
export const DeleteCartItemSchema = z.object({ ...DeleteCartItemParams })
export const GetCartItemsSchema = z.object({ ...GetCartItemsParams })
