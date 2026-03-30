import * as z from 'zod'

const SignUpPayload = {
    body: z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        type: z.enum(['user', 'admin']).optional().default('user'),
        vendor_id: z.string().uuid().optional(),
    }),
}

const SignInPayload = {
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
    }),
}

const EditUserPayload = {
    body: z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        id: z.uuidv4(),
    }),
}

const DeleteUserParams = {
    params: z.object({
        id: z.uuidv4(),
    }),
}

const ResetPasswordPayload = {
    body: z.object({
        newPassword: z.string().min(6),
    }),
}

const RefreshPayload = {
    body: z.object({
        refreshToken: z.string().min(1),
    }),
}

export const SignUpSchema = z.object({ ...SignUpPayload })
export const SignInSchema = z.object({ ...SignInPayload })
export const EditUserSchema = z.object({ ...EditUserPayload })
export const DeleteUserSchema = z.object({ ...DeleteUserParams })
export const ResetPasswordSchema = z.object({ ...ResetPasswordPayload })
export const RefreshSchema = z.object({ ...RefreshPayload })
