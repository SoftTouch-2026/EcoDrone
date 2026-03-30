import * as z from 'zod'

export const CreateAdminUserPayload = {
    body: z.object({
        email: z.string().email(),
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        password: z.string().min(6),
        type: z.enum(['user', 'admin']).optional().default('user'),
    }),
}

export const UpdateAdminUserPayload = {
    body: z.object({
        email: z.string().email().optional(),
        first_name: z.string().min(1).optional(),
        last_name: z.string().min(1).optional(),
        password: z.string().min(6).optional(),
        type: z.enum(['user', 'admin']).optional(),
        should_reset_password: z.boolean().optional(),
    }),
}

export const GetAdminUserParams = {
    params: z.object({
        id: z.string().uuid(),
    }),
}

export const ListAdminUsersQuery = {
    query: z.object({
        page: z.string().min(1).optional().default('1'),
        limit: z.string().min(1).optional().default('10'),
        type: z.enum(['user', 'admin']).optional(),
    }),
}

export const CreateAdminUserSchema = z.object({ ...CreateAdminUserPayload })
export const UpdateAdminUserSchema = z.object({
    body: UpdateAdminUserPayload.body,
    params: GetAdminUserParams.params,
})
export const GetAdminUserSchema = z.object({ ...GetAdminUserParams })
export const ListAdminUsersSchema = z.object({ ...ListAdminUsersQuery })
export const DeleteAdminUserSchema = z.object({ ...GetAdminUserParams })
