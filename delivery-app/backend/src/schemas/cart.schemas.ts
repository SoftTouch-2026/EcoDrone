import * as z from 'zod'

export const CreateCartPayload = {
    body: z.object({
        user_id: z.string().min(1),
    }),
}

export const DeleteCartParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetCartParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetCartByUserParams = {
    params: z.object({
        userId: z.string().min(1),
    }),
}

export const CreateCartSchema = z.object({ ...CreateCartPayload })
export const DeleteCartSchema = z.object({ ...DeleteCartParams })
export const GetCartSchema = z.object({ ...GetCartParams })
export const GetCartByUserSchema = z.object({ ...GetCartByUserParams })
