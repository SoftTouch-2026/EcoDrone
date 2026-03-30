import { prisma } from '../utils/connect'
import { hash, compare } from 'bcrypt'
import {
    DeleteUserInput,
    EditUserInput,
    ResetPasswordInput,
    SignInInput,
    SignUpInput,
} from '../utils/types'
import { signJWT, signRefreshJWT, verifyRefreshJWT } from '../utils/jwtUtils'
import { JwtPayload } from 'jsonwebtoken'

export const refreshTokenService = async (refreshToken: string) => {
    try {
        if (!refreshToken) {
            throw new Error('Unauthorized')
        }

        const decoded = verifyRefreshJWT(refreshToken)
        if (!decoded) {
            throw new Error('Unauthorized')
        }

        const user = await prisma.users.findUnique({
            where: {
                id: (decoded as JwtPayload)?.id as unknown as string,
            },
        })

        if (!user) {
            throw new Error('Unauthorized')
        }

        const newAccessToken = signJWT(user)
        const newRefreshToken = signRefreshJWT(user)

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }
    } catch (e) {
        throw e
    }
}

export const signUpService = async (data: SignUpInput['body']) => {
    try {
        const { email, first_name, last_name, password, type, vendor_id } = data
        const candidateHash = await hash(password, 10)

        if (vendor_id) {
            const vendor = await prisma.vendors.findUnique({
                where: { id: vendor_id },
                select: { id: true },
            })
            if (!vendor) {
                throw new Error('Vendor not found')
            }
        }

        const user = await prisma.users.create({
            data: {
                email,
                first_name,
                last_name,
                password_hash: candidateHash,
                type: type || ('user' as any),
                vendor_id: vendor_id ?? null,
            },
        })

        const accessToken = signJWT(user)
        const refreshToken = signRefreshJWT(user)
        return {
            user: sanitizeUser(user),
            accessToken,
            refreshToken,
        }
    } catch (e) {
        throw e
    }
}

const sanitizeUser = (user: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    type: string | null
    should_reset_password?: boolean
    vendor_id?: string | null
    created_at: Date
    updated_at: Date
}) => ({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    type: user.type,
    should_reset_password: user.should_reset_password ?? false,
    vendor_id: user.vendor_id ?? null,
    created_at: user.created_at,
    updated_at: user.updated_at,
})

export const signInService = async (data: SignInInput['body']) => {
    try {
        const { email, password } = data

        const users = await prisma.users.findMany({
            where: { email },
        })
        if (!users?.length) {
            throw new Error('User not found')
        }
        const user = users[0]
        if (!user) {
            throw new Error('User not found')
        }
        const isPasswordValid = await compare(
            password,
            user.password_hash || ''
        )
        if (!isPasswordValid) {
            throw new Error('Invalid password')
        }

        const accessToken = signJWT(user)
        const refreshToken = signRefreshJWT(user)

        return {
            user: sanitizeUser(user),
            accessToken,
            refreshToken,
        }
    } catch (error) {
        throw error
    }
}

export const editUserService = async (data: EditUserInput['body']) => {
    try {
        const { id, email, first_name, last_name, password } = data
        const candidateHash = await hash(password, 10)

        const user = await prisma.users.update({
            where: { id },
            data: {
                email,
                first_name,
                last_name,
                password_hash: candidateHash,
            },
        })
        return sanitizeUser(user)
    } catch (e) {
        throw e
    }
}

export const deleteUserService = async (data: DeleteUserInput['params']) => {
    try {
        const { id } = data
        const user = await prisma.users.delete({
            where: { id },
        })
        return sanitizeUser(user)
    } catch (e) {
        throw e
    }
}

export const resetPasswordService = async (
    userId: string,
    data: ResetPasswordInput['body']
) => {
    try {
        const { newPassword } = data
        const candidateHash = await hash(newPassword, 10)
        const user = await prisma.users.update({
            where: { id: userId },
            data: {
                password_hash: candidateHash,
                should_reset_password: false,
            },
        })
        return sanitizeUser(user)
    } catch (e) {
        throw e
    }
}
