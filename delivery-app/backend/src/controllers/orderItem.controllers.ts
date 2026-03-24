import { Request, Response } from 'express'
import {
    CreateOrderItemInput,
    UpdateOrderItemInput,
    DeleteOrderItemInput,
    GetOrderItemsInput,
} from '../utils/types'
import {
    createOrderItemService,
    updateOrderItemService,
    deleteOrderItemService,
    getOrderItemsService,
} from '../services/orderItem.service'

export const handleCreateOrderItemRequest = async (
    req: Request<{}, {}, CreateOrderItemInput['body']>,
    res: Response
) => {
    try {
        const orderItem = await createOrderItemService(req.body)
        return res.status(201).send(orderItem)
    } catch (e) {
        return res.status(400).send(e)
    }
}

export const handleUpdateOrderItemRequest = async (
    req: Request<{}, {}, UpdateOrderItemInput['body']>,
    res: Response
) => {
    try {
        const orderItem = await updateOrderItemService(req.body)
        return res.status(200).send(orderItem)
    } catch (e) {
        return res.status(400).send(e)
    }
}

export const handleDeleteOrderItemRequest = async (
    req: Request<DeleteOrderItemInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const orderItem = await deleteOrderItemService(req.params)
        return res.status(200).send(orderItem)
    } catch (e) {
        return res.status(400).send(e)
    }
}

export const handleGetOrderItemsRequest = async (
    req: Request<GetOrderItemsInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const orderItems = await getOrderItemsService(req.params)
        return res.status(200).send(orderItems)
    } catch (e) {
        return res.status(400).send(e)
    }
}
