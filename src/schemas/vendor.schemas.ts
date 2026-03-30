import * as z from 'zod'

export const VendorMeMenuCreatePayload = {
    body: z.object({
        name: z.string().min(1),
        unit_cost: z.number(),
        description: z.string().optional(),
        thumbnail: z.string().optional(),
    }),
}

export const VendorMeMenuUpdateParams = {
    params: z.object({
        id: z.string().uuid(),
    }),
}

export const VendorMeMenuUpdatePayload = {
    body: z.object({
        name: z.string().min(1),
        unit_cost: z.number(),
        description: z.string().optional(),
        thumbnail: z.string().optional(),
    }),
}

export const VendorMeOrdersQuery = {
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
}

export const VendorMeOrderFulfillParams = {
    params: z.object({
        orderId: z.string().uuid(),
    }),
}

export const VendorMeOrderItemFulfillParams = {
    params: z.object({
        orderId: z.string().uuid(),
        orderItemId: z.string().uuid(),
    }),
}

export const VendorMeMenuCreateSchema = z.object({ ...VendorMeMenuCreatePayload })
export const VendorMeMenuUpdateSchema = z.object({
    params: VendorMeMenuUpdateParams.params,
    body: VendorMeMenuUpdatePayload.body,
})
export const VendorMeMenuDeleteSchema = z.object({
    params: VendorMeMenuUpdateParams.params,
})
export const VendorMeOrdersSchema = z.object({ ...VendorMeOrdersQuery })
export const VendorMeOrderFulfillSchema = z.object({
    ...VendorMeOrderFulfillParams,
})
export const VendorMeOrderItemFulfillSchema = z.object({
    ...VendorMeOrderItemFulfillParams,
})
