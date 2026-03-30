import { Request, Response } from 'express'
import { sendError } from '../utils/errorResponse'
import {
    CreateCartInput,
    DeleteCartInput,
    GetCartInput,
    GetCartByUserInput,
} from '../utils/types'
import {
    createCartService,
    deleteCartService,
    getCartService,
    getCartByUserService,
} from '../services/cart.service'

export const handleCreateCartRequest = async (
    req: Request<{}, {}, CreateCartInput['body']>,
    res: Response
) => {
    try {
        const cart = await createCartService(req.body)
        return res.status(201).send(cart)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleDeleteCartRequest = async (
    req: Request<DeleteCartInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const cart = await deleteCartService(req.params)
        return res.status(200).send(cart)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleGetCartRequest = async (
    req: Request<GetCartInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const cart = await getCartService(req.params)
        return res.status(200).send(cart)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleGetCartByUserRequest = async (
    req: Request<GetCartByUserInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const cart = await getCartByUserService(req.params)
        return res.status(200).send(cart)
    } catch (e) {
        return sendError(res, 400, e)
    }
}
