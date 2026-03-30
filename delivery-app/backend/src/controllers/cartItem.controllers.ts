import { Request, Response } from 'express'
import { sendError } from '../utils/errorResponse'
import {
    AddCartItemInput,
    UpdateCartItemInput,
    DeleteCartItemInput,
    GetCartItemsInput,
} from '../utils/types'
import {
    addCartItemService,
    updateCartItemService,
    deleteCartItemService,
    getCartItemsService,
} from '../services/cartItem.service'

export const handleAddCartItemRequest = async (
    req: Request<{}, {}, AddCartItemInput['body']>,
    res: Response
) => {
    try {
        const cartItem = await addCartItemService(req.body)
        return res.status(201).send(cartItem)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleUpdateCartItemRequest = async (
    req: Request<{}, {}, UpdateCartItemInput['body']>,
    res: Response
) => {
    try {
        const cartItem = await updateCartItemService(req.body)
        return res.status(200).send(cartItem)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleDeleteCartItemRequest = async (
    req: Request<DeleteCartItemInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const cartItem = await deleteCartItemService(req.params)
        return res.status(200).send(cartItem)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleGetCartItemsRequest = async (
    req: Request<GetCartItemsInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const cartItems = await getCartItemsService(req.params)
        return res.status(200).send(cartItems)
    } catch (e) {
        return sendError(res, 400, e)
    }
}
