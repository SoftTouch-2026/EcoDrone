import { Request, Response } from 'express'
import {
    CreateOrderInput,
    UpdateOrderInput,
    DeleteOrderInput,
    GetOrderInput,
    GetOrdersInput,
} from '../utils/types'
import {
    createOrderService,
    updateOrderService,
    deleteOrderService,
    getOrderService,
    getOrdersService,
} from '../services/orders.service'

export const handleCreateOrderRequest = async (
    req: Request<{}, {}, CreateOrderInput['body']>,
    res: Response
) => {
    try {
        const order = await createOrderService(req.body)
        res.status(201).json(order)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleUpdateOrderRequest = async (
    req: Request<{}, {}, UpdateOrderInput['body']>,
    res: Response
) => {
    try {
        const order = await updateOrderService(req.body)
        res.status(200).json(order)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleDeleteOrderRequest = async (
    req: Request<DeleteOrderInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const order = await deleteOrderService(req.params)
        res.status(200).json(order)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleGetOrderRequest = async (
    req: Request<GetOrderInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const order = await getOrderService(req.params)
        res.status(200).json(order)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleGetOrdersRequest = async (
    req: Request<GetOrdersInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const orders = await getOrdersService(req.params)
        res.status(200).json(orders)
    } catch (e) {
        res.status(400).send(e)
    }
}
