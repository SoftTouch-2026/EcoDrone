import { Request, Response } from 'express'
import {
    SignInInput,
    SignUpInput,
    EditUserInput,
    DeleteUserInput,
} from '../utils/types'
import { signJWT, signRefreshJWT, verifyRefreshJWT } from '../utils/jwtUtils'
import { prisma } from '../utils/connect'
import { compare, hash } from 'bcrypt'
import { JwtPayload } from 'jsonwebtoken'
import {
    signUpService,
    signInService,
    editUserService,
    deleteUserService,
} from '../services/auth.service'

export const handleRefreshRequest = async (
    req: Request<{}, {}, any>,
    res: Response
) => {
    try {
        const refreshToken = req.body.refreshToken
        if (!refreshToken) {
            return res.status(401).send({
                status: 'error',
                message: 'Unauthorized',
            })
        }
        const decoded = verifyRefreshJWT(refreshToken)
        if (!decoded) {
            return res.status(401).send({
                status: 'error',
                message: 'Unauthorized',
            })
        }
        const user = await prisma.users.findUnique({
            where: {
                id: (decoded as JwtPayload)?.id as unknown as string,
            },
        })
        if (!user) {
            return res.status(401).send({
                status: 'error',
                message: 'Unauthorized',
            })
        }
        const newAccessToken = signJWT(user)
        const newRefreshToken = signRefreshJWT(user)
        return res.status(200).send({
            status: 'success',
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        })
    } catch (e) {
        res.status(403).send({
            status: 'error',
            message: 'Forbidden',
        })
    }
}

export const handleSignUpRequest = async (
    req: Request<{}, {}, SignUpInput['body']>,
    res: Response
) => {
    try {
        const { user, token } = await signUpService(req.body)
        return res.status(200).send({
            status: 'success',
            message: 'User created successfully',
            data: { user, token },
        })
    } catch (e: any) {
        res.status(400).send({
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
        const user = await signInService(req.body)
        const accessToken = signJWT(user[0])
        const refreshToken = signRefreshJWT(user[0])
        return res.status(200).send({
            status: 'success',
            message: 'User signed in successfully',
            data: {
                user: user[0],
                accessToken,
                refreshToken,
            },
        })
    } catch (e: any) {
        res.status(400).send({
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
        return res.status(200).send({
            status: 'success',
            message: 'User updated successfully',
            data: user,
        })
    } catch (e: any) {
        res.status(400).send({
            status: 'error',
            message: e.message,
        })
    }
}

export const handleDeleteUserRequest = async (
    req: Request<DeleteUserInput['params'], {}>,
    res: Response
) => {
    try {
        const user = await deleteUserService(req.params)
        return res.status(200).send({
            status: 'success',
            message: 'User deleted successfully',
            data: user,
        })
    } catch (e: any) {
        res.status(400).send({
            status: 'error',
            message: e.message,
        })
    }
}
