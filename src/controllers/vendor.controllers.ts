import { Request, Response } from 'express'
import {
    getVendorMeService,
    getVendorMenuService,
    createVendorMenuItemService,
    updateVendorMenuItemService,
    deleteVendorMenuItemService,
    getOrdersForVendorService,
    fulfillOrderItemsForVendorService,
    fulfillSingleOrderItemForVendorService,
} from '../services/vendor.service'
import { sendError } from '../utils/errorResponse'
import { createAuditLog } from '../services/audit.service'

export async function handleGetVendorMeRequest(req: Request, res: Response) {
    try {
        const vendorId = res.locals.user?.vendor_id
        if (!vendorId) {
            return res.status(404).json({
                status: 'error',
                message: 'Vendor not found',
            })
        }
        const vendor = await getVendorMeService(vendorId)
        if (!vendor) {
            return res.status(404).json({
                status: 'error',
                message: 'Vendor not found',
            })
        }
        return res.status(200).json(vendor)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleGetVendorMeMenuRequest(req: Request, res: Response) {
    try {
        const vendorId = res.locals.user?.vendor_id
        if (!vendorId) {
            return res.status(403).json({
                status: 'error',
                message: 'Vendor account required',
            })
        }
        const items = await getVendorMenuService(vendorId)
        return res.status(200).json(items)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleCreateVendorMeMenuRequest(req: Request, res: Response) {
    try {
        const vendorId = res.locals.user?.vendor_id
        if (!vendorId) {
            return res.status(403).json({
                status: 'error',
                message: 'Vendor account required',
            })
        }
        const menu = await createVendorMenuItemService(vendorId, req.body)
        return res.status(201).json(menu)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleUpdateVendorMeMenuRequest(req: Request, res: Response) {
    try {
        const vendorId = res.locals.user?.vendor_id
        const id = (req as any).params?.id
        if (!vendorId || !id) {
            return res.status(400).json({
                status: 'error',
                message: 'Bad request',
            })
        }
        const menu = await updateVendorMenuItemService(vendorId, id, req.body)
        if (!menu) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found',
            })
        }
        return res.status(200).json(menu)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleDeleteVendorMeMenuRequest(req: Request, res: Response) {
    try {
        const vendorId = res.locals.user?.vendor_id
        const id = (req as any).params?.id
        if (!vendorId || !id) {
            return res.status(400).json({
                status: 'error',
                message: 'Bad request',
            })
        }
        const menu = await deleteVendorMenuItemService(vendorId, id)
        if (!menu) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found',
            })
        }
        return res.status(200).json(menu)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleGetVendorMeOrdersRequest(req: Request, res: Response) {
    try {
        const vendorId = res.locals.user?.vendor_id
        if (!vendorId) {
            return res.status(403).json({
                status: 'error',
                message: 'Vendor account required',
            })
        }
        const result = await getOrdersForVendorService(vendorId, req.query as { page?: string; limit?: string })
        return res.status(200).json(result)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleFulfillVendorMeOrderRequest(req: Request, res: Response) {
    try {
        const vendorId = res.locals.user?.vendor_id
        const orderId = (req as any).params?.orderId
        if (!vendorId || !orderId) {
            return res.status(400).json({
                status: 'error',
                message: 'Bad request',
            })
        }
        const result = await fulfillOrderItemsForVendorService(orderId, vendorId)
        if (!result.success) {
            if (result.error === 'Order not found') {
                return res.status(404).json({
                    status: 'error',
                    message: result.error,
                })
            }
            return res.status(403).json({
                status: 'error',
                message: result.error,
            })
        }
        await createAuditLog({
            action: 'vendor.fulfill_order',
            resourceType: 'order',
            resourceId: orderId,
            actorId: res.locals.user?.id,
            message: 'Vendor marked order items fulfilled',
            metadata: { order_id: orderId },
            success: true,
            req,
        })
        return res.status(200).json(result.order)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export async function handleFulfillVendorMeOrderItemRequest(
    req: Request,
    res: Response
) {
    try {
        const vendorId = res.locals.user?.vendor_id
        const orderId = (req as any).params?.orderId
        const orderItemId = (req as any).params?.orderItemId
        if (!vendorId || !orderId || !orderItemId) {
            return res.status(400).json({
                status: 'error',
                message: 'Bad request',
            })
        }
        const result = await fulfillSingleOrderItemForVendorService(
            orderId,
            orderItemId,
            vendorId
        )
        if (!result.success) {
            if (result.error === 'Order item not found') {
                return res.status(404).json({
                    status: 'error',
                    message: result.error,
                })
            }
            return res.status(403).json({
                status: 'error',
                message: result.error,
            })
        }
        await createAuditLog({
            action: 'vendor.fulfill_order_item',
            resourceType: 'order_item',
            resourceId: orderItemId,
            actorId: res.locals.user?.id,
            message: 'Vendor marked order item fulfilled',
            metadata: { order_id: orderId, order_item_id: orderItemId },
            success: true,
            req,
        })
        return res.status(200).json(result.orderItem)
    } catch (e) {
        return sendError(res, 400, e)
    }
}
