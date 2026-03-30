import * as z from 'zod'

export const CreateLocationPayload = {
    body: z.object({
        name: z.string().min(1),
        latitude: z.number(),
        longitude: z.number(),
    }),
}

export const UpdateLocationPayload = {
    body: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        latitude: z.number(),
        longitude: z.number(),
    }),
}

export const DeleteLocationParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetLocationParams = {
    params: z.object({
        id: z.string().min(1),
    }),
}

export const GetLocationsQuery = {
    query: z.object({
        page: z.string().min(1).optional(),
        limit: z.string().min(1).optional(),
    }),
}

export const CreateLocationSchema = z.object({ ...CreateLocationPayload })
export const UpdateLocationSchema = z.object({ ...UpdateLocationPayload })
export const DeleteLocationSchema = z.object({ ...DeleteLocationParams })
export const GetLocationSchema = z.object({ ...GetLocationParams })
export const GetLocationsSchema = z.object({ ...GetLocationsQuery })
