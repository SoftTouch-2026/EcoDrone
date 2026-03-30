import * as z from 'zod'

export const CreateVendorPayload = {
    body: z.object({
        name: z.string().min(1),
        location_id: z.string().optional(),
        hours: z.string().optional(),
        description: z.string().optional(),
        emoji: z.string().optional(),
        momo_number: z.string().optional(),
        thumbnail_url: z.string().optional(),
    }),
}

export const UpdateVendorPayload = {
    body: z.object({
        id: z.string().min(1),
        name: z.string().optional(),
        location_id: z.string().optional(),
        hours: z.string().optional(),
        description: z.string().optional(),
        emoji: z.string().optional(),
        momo_number: z.string().optional(),
        thumbnail_url: z.string().optional(),
    }),
}

export const DeleteVendorParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetVendorParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetVendorsQuery = {
    query: z.object({
        page: z.string().min(1).optional(),
        limit: z.string().min(1).optional(),
    }),
}

export const GetVendorMenuParams = {
    params: z.object({
        vendorId: z.string().min(1),
    }),
}

export const CreateVendorSchema = z.object({ ...CreateVendorPayload })
export const UpdateVendorSchema = z.object({ ...UpdateVendorPayload })
export const DeleteVendorSchema = z.object({ ...DeleteVendorParams })
export const GetVendorSchema = z.object({ ...GetVendorParams })
export const GetVendorsSchema = z.object({ ...GetVendorsQuery })
export const GetVendorMenuSchema = z.object({ ...GetVendorMenuParams })
