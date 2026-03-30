import { prisma } from '../utils/connect'
import { hash } from 'bcrypt'
import {
    CreateAdminUserInput,
    UpdateAdminUserInput,
    GetAdminUserInput,
    ListAdminUsersInput,
    DeleteAdminUserInput,
} from '../utils/types'

export const createAdminUserService = async (
    data: CreateAdminUserInput['body']
) => {
    const { email, first_name, last_name, password, type } = data
    const candidateHash = await hash(password, 10)
    const user = await prisma.users.create({
        data: {
            email,
            first_name,
            last_name,
            password_hash: candidateHash,
            type: type || 'user',
            should_reset_password: true,
        },
    })
    const { password_hash: _, ...userWithoutHash } = user
    return userWithoutHash
}

export const listAdminUsersService = async (
    data: ListAdminUsersInput['query']
) => {
    const { page = '1', limit = '10', type } = data
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10)
    const take = parseInt(limit, 10)
    const where = type ? { type } : {}
    const [users, total] = await Promise.all([
        prisma.users.findMany({
            where,
            skip,
            take,
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                type: true,
                should_reset_password: true,
                created_at: true,
                updated_at: true,
            },
        }),
        prisma.users.count({ where }),
    ])
    return { users, total, page: parseInt(page, 10), limit: take }
}

export const getAdminUserService = async (data: GetAdminUserInput['params']) => {
    const { id } = data
    const user = await prisma.users.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            type: true,
            should_reset_password: true,
            created_at: true,
            updated_at: true,
        },
    })
    if (!user) {
        throw new Error('User not found')
    }
    return user
}

export const updateAdminUserService = async (
    data: UpdateAdminUserInput['params'],
    body: UpdateAdminUserInput['body']
) => {
    const { id } = data
    const updateData: {
        email?: string
        first_name?: string
        last_name?: string
        password_hash?: string
        type?: 'user' | 'admin'
        should_reset_password?: boolean
    } = {}
    if (body.email !== undefined) updateData.email = body.email
    if (body.first_name !== undefined) updateData.first_name = body.first_name
    if (body.last_name !== undefined) updateData.last_name = body.last_name
    if (body.type !== undefined) updateData.type = body.type
    if (body.should_reset_password !== undefined)
        updateData.should_reset_password = body.should_reset_password
    if (body.password !== undefined) {
        updateData.password_hash = await hash(body.password, 10)
    }
    const user = await prisma.users.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            type: true,
            should_reset_password: true,
            created_at: true,
            updated_at: true,
        },
    })
    return user
}

export const deleteAdminUserService = async (
    data: DeleteAdminUserInput['params'],
    currentUserId: string
) => {
    const { id } = data
    if (id === currentUserId) {
        throw new Error('Cannot delete your own account')
    }
    const user = await prisma.users.delete({
        where: { id },
        select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            type: true,
        },
    })
    return user
}
