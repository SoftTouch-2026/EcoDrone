import { Request, Response } from 'express'
import {
    CreateAdminUserInput,
    UpdateAdminUserInput,
    GetAdminUserInput,
    ListAdminUsersInput,
    DeleteAdminUserInput,
} from '../utils/types'
import {
    createAdminUserService,
    listAdminUsersService,
    getAdminUserService,
    updateAdminUserService,
    deleteAdminUserService,
} from '../services/admin.service'
import { createAuditLog } from '../services/audit.service'

export const handleCreateAdminUserRequest = async (
    req: Request<{}, {}, CreateAdminUserInput['body']>,
    res: Response
) => {
    try {
        const user = await createAdminUserService(req.body)
        await createAuditLog({
            action: 'admin.user.create',
            resourceType: 'user',
            resourceId: user.id,
            actorId: res.locals.user?.id,
            message: 'Admin created user',
            metadata: { email: user.email },
            success: true,
            req,
        })
        return res.status(201).send({
            status: 'success',
            message: 'User created successfully',
            data: user,
        })
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Bad request'
        await createAuditLog({
            action: 'admin.user.create',
            resourceType: 'user',
            actorId: res.locals.user?.id,
            message,
            success: false,
            req,
        })
        return res.status(400).send({
            status: 'error',
            message,
        })
    }
}

export const handleListAdminUsersRequest = async (
    req: Request<{}, {}, {}, ListAdminUsersInput['query']>,
    res: Response
) => {
    try {
        const result = await listAdminUsersService(req.query)
        return res.status(200).send({
            status: 'success',
            message: 'Users retrieved successfully',
            data: result,
        })
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Bad request'
        return res.status(400).send({
            status: 'error',
            message,
        })
    }
}

export const handleGetAdminUserRequest = async (
    req: Request<GetAdminUserInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const user = await getAdminUserService(req.params)
        return res.status(200).send({
            status: 'success',
            message: 'User retrieved successfully',
            data: user,
        })
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Bad request'
        const status = message === 'User not found' ? 404 : 400
        return res.status(status).send({
            status: 'error',
            message,
        })
    }
}

export const handleUpdateAdminUserRequest = async (
    req: Request<UpdateAdminUserInput['params'], {}, UpdateAdminUserInput['body']>,
    res: Response
) => {
    const targetId = req.params?.id
    try {
        const user = await updateAdminUserService(req.params, req.body)
        await createAuditLog({
            action: 'admin.user.update',
            resourceType: 'user',
            resourceId: targetId,
            actorId: res.locals.user?.id,
            message: 'Admin updated user',
            success: true,
            req,
        })
        return res.status(200).send({
            status: 'success',
            message: 'User updated successfully',
            data: user,
        })
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Bad request'
        await createAuditLog({
            action: 'admin.user.update',
            resourceType: 'user',
            resourceId: targetId,
            actorId: res.locals.user?.id,
            message,
            success: false,
            req,
        })
        const status = message === 'User not found' ? 404 : 400
        return res.status(status).send({
            status: 'error',
            message,
        })
    }
}

export const handleDeleteAdminUserRequest = async (
    req: Request<DeleteAdminUserInput['params'], {}, {}>,
    res: Response
) => {
    const currentUserId = res.locals.user?.id
    const targetId = req.params?.id
    if (!currentUserId) {
        return res.status(401).send({
            status: 'error',
            message: 'Unauthorized',
        })
    }
    try {
        const user = await deleteAdminUserService(req.params, currentUserId)
        await createAuditLog({
            action: 'admin.user.delete',
            resourceType: 'user',
            resourceId: targetId,
            actorId: currentUserId,
            message: 'Admin deleted user',
            success: true,
            req,
        })
        return res.status(200).send({
            status: 'success',
            message: 'User deleted successfully',
            data: user,
        })
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Bad request'
        await createAuditLog({
            action: 'admin.user.delete',
            resourceType: 'user',
            resourceId: targetId,
            actorId: currentUserId,
            message,
            success: false,
            req,
        })
        const status =
            message === 'Cannot delete your own account' ? 403 : 400
        return res.status(status).send({
            status: 'error',
            message,
        })
    }
}
