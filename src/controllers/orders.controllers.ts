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
import { sendError } from '../utils/errorResponse'
import { createAuditLog } from '../services/audit.service'

export const handleCreateOrderRequest = async (
    req: Request<{}, {}, CreateOrderInput['body']>,
    res: Response
) => {
    try {
        const order = await createOrderService(req.body)
        await createAuditLog({
            action: 'order.create',
            resourceType: 'order',
            resourceId: order.id,
            actorId: res.locals.user?.id,
            message: 'Order created',
            success: true,
            req,
        })
        res.status(201).json(order)
    } catch (e) {
        await createAuditLog({
            action: 'order.create',
            resourceType: 'order',
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Create order failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleUpdateOrderRequest = async (
    req: Request<{}, {}, UpdateOrderInput['body']>,
    res: Response
) => {
    const orderId = req.body?.id
    try {
        const order = await updateOrderService(req.body)
        await createAuditLog({
            action: 'order.update',
            resourceType: 'order',
            resourceId: orderId ?? order.id,
            actorId: res.locals.user?.id,
            message: 'Order updated',
            success: true,
            req,
        })
        res.status(200).json(order)
    } catch (e) {
        await createAuditLog({
            action: 'order.update',
            resourceType: 'order',
            resourceId: orderId,
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Update order failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleDeleteOrderRequest = async (
    req: Request<DeleteOrderInput['params'], {}, {}>,
    res: Response
) => {
    const id = req.params?.id
    try {
        const order = await deleteOrderService(req.params)
        await createAuditLog({
            action: 'order.delete',
            resourceType: 'order',
            resourceId: id,
            actorId: res.locals.user?.id,
            message: 'Order deleted',
            success: true,
            req,
        })
        res.status(200).json(order)
    } catch (e) {
        await createAuditLog({
            action: 'order.delete',
            resourceType: 'order',
            resourceId: id,
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Delete order failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
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
        return sendError(res, 400, e)
    }
}

export const handleGetOrdersRequest = async (
    req: Request<{}, {}, {}, GetOrdersInput['query']>,
    res: Response
) => {
    try {
        const orders = await getOrdersService(req.query)
        res.status(200).json(orders)
    } catch (e) {
        return sendError(res, 400, e)
    }
}
