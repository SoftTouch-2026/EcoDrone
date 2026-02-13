import * as z from 'zod'

export const CreateMenuPayload = {
    body: z.object({
        name: z.string().min(1),
        unit_cost: z.number(),
        description: z.string().optional(),
        thumbnail: z.string().optional(),
    }),
}

export const UpdateMenuPayload = {
    body: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        unit_cost: z.number(),
        description: z.string().optional(),
        thumbnail: z.string().optional(),
    }),
}

export const DeleteMenuParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetMenuParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetMenusParams = {
    params: z.object({
        page: z.string().min(1),
        limit: z.string().min(1),
    }),
}

export const CreateMenuSchema = z.object({ ...CreateMenuPayload })
export const UpdateMenuSchema = z.object({ ...UpdateMenuPayload })
export const DeleteMenuSchema = z.object({ ...DeleteMenuParams })
export const GetMenuSchema = z.object({ ...GetMenuParams })
export const GetMenusSchema = z.object({ ...GetMenusParams })
