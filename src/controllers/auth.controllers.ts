import { Request, Response } from 'express'
import {
    SignInInput,
    SignUpInput,
    EditUserInput,
    DeleteUserInput,
    ResetPasswordInput,
} from '../utils/types'
import {
    refreshTokenService,
    signUpService,
    signInService,
    editUserService,
    deleteUserService,
    resetPasswordService,
} from '../services/auth.service'
import { createAuditLog } from '../services/audit.service'

export const handleRefreshRequest = async (
    req: Request<{}, {}, any>,
    res: Response
) => {
    try {
        const tokens = await refreshTokenService(req.body.refreshToken)
        await createAuditLog({
            action: 'auth.refresh',
            resourceType: 'user',
            actorId: res.locals.user?.id,
            message: 'Token refreshed successfully',
            success: true,
            req,
        })
        return res.status(200).send({
            status: 'success',
            message: 'Token refreshed successfully',
            data: tokens,
        })
    } catch (e: any) {
        await createAuditLog({
            action: 'auth.refresh',
            resourceType: 'user',
            message: e?.message ?? 'Refresh failed',
            success: false,
            req,
        })
        const statusCode = e.message === 'Unauthorized' ? 401 : 403
        return res.status(statusCode).send({
            status: 'error',
            message: e.message,
        })
    }
}

export const handleSignUpRequest = async (
    req: Request<{}, {}, SignUpInput['body']>,
    res: Response
) => {
    try {
        const { user, accessToken, refreshToken } = await signUpService(
            req.body
        )
        await createAuditLog({
            action: 'auth.sign_up',
            resourceType: 'user',
            resourceId: user.id,
            message: 'User registered',
            metadata: { email: req.body.email },
            success: true,
            req,
        })
        return res.status(201).send({
            status: 'success',
            message: 'User created successfully',
            data: { user, accessToken, refreshToken },
        })
    } catch (e: any) {
        await createAuditLog({
            action: 'auth.sign_up',
            resourceType: 'user',
            message: e?.message ?? 'Sign up failed',
            metadata: { email: req.body.email },
            success: false,
            req,
        })
        return res.status(400).send({
            status: 'error',
            message: e.message,
        })
    }
}

export const handleSignInRequest = async (
    req: Request<{}, {}, SignInInput['body']>,
    res: Response
) => {
    try {
        const { user, accessToken, refreshToken } = await signInService(
            req.body
        )
        await createAuditLog({
            action: 'auth.sign_in',
            resourceType: 'user',
            resourceId: user.id,
            actorId: user.id,
            message: 'Sign in successful',
            metadata: { email: req.body.email },
            success: true,
            req,
        })
        return res.status(200).send({
            status: 'success',
            message: 'User signed in successfully',
            data: {
                user,
                accessToken,
                refreshToken,
            },
        })
    } catch (e: any) {
        await createAuditLog({
            action: 'auth.sign_in',
            resourceType: 'user',
            message: e?.message ?? 'Sign in failed',
            metadata: { email: req.body.email },
            success: false,
            req,
        })
        return res.status(400).send({
            status: 'error',
            message: e.message,
        })
    }
}

export const handleEditUserRequest = async (
    req: Request<{}, {}, EditUserInput['body']>,
    res: Response
) => {
    try {
        const user = await editUserService(req.body)
        await createAuditLog({
            action: 'auth.edit_user',
            resourceType: 'user',
            resourceId: user.id,
            actorId: res.locals.user?.id,
            message: 'User profile updated',
            success: true,
            req,
        })
        return res.status(200).send({
            status: 'success',
            message: 'User updated successfully',
            data: user,
        })
    } catch (e: any) {
        await createAuditLog({
            action: 'auth.edit_user',
            resourceType: 'user',
            resourceId: req.body.id,
            actorId: res.locals.user?.id,
            message: e?.message ?? 'Edit user failed',
            success: false,
            req,
        })
        return res.status(400).send({
            status: 'error',
            message: e.message,
        })
    }
}

export const handleDeleteUserRequest = async (
    req: Request<DeleteUserInput['params'], {}>,
    res: Response
) => {
    const targetId = req.params?.id
    try {
        const user = await deleteUserService(req.params)
        await createAuditLog({
            action: 'auth.delete_user',
            resourceType: 'user',
            resourceId: targetId,
            actorId: res.locals.user?.id,
            message: 'User account deleted',
            success: true,
            req,
        })
        return res.status(200).send({
            status: 'success',
            message: 'User deleted successfully',
            data: user,
        })
    } catch (e: any) {
        await createAuditLog({
            action: 'auth.delete_user',
            resourceType: 'user',
            resourceId: targetId,
            actorId: res.locals.user?.id,
            message: e?.message ?? 'Delete user failed',
            success: false,
            req,
        })
        return res.status(400).send({
            status: 'error',
            message: e.message,
        })
    }
}

export const handleResetPasswordRequest = async (
    req: Request<{}, {}, ResetPasswordInput['body']>,
    res: Response
) => {
    const userId = res.locals.user?.id
    if (!userId) {
        return res.status(401).send({
            status: 'error',
            message: 'Unauthorized',
        })
    }
    try {
        const user = await resetPasswordService(userId, req.body)
        await createAuditLog({
            action: 'auth.reset_password',
            resourceType: 'user',
            resourceId: user.id,
            actorId: userId,
            message: 'Password reset successfully',
            success: true,
            req,
        })
        return res.status(200).send({
            status: 'success',
            message: 'Password reset successfully',
            data: { id: user.id, should_reset_password: user.should_reset_password },
        })
    } catch (e: any) {
        await createAuditLog({
            action: 'auth.reset_password',
            resourceType: 'user',
            resourceId: userId,
            actorId: userId,
            message: e?.message ?? 'Password reset failed',
            success: false,
            req,
        })
        return res.status(400).send({
            status: 'error',
            message: e.message,
        })
    }
}
