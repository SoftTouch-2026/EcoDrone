import { Request, Response } from 'express'
import { sendError } from '../utils/errorResponse'
import {
    CreateVendorInput,
    UpdateVendorInput,
    DeleteVendorInput,
    GetVendorInput,
    GetVendorsInput,
    GetVendorMenuInput,
} from '../utils/types'
import {
    createVendorService,
    updateVendorService,
    deleteVendorService,
    getVendorService,
    getVendorsService,
    getVendorMenuService,
} from '../services/vendors.service'
import { createAuditLog } from '../services/audit.service'

export const handleCreateVendorRequest = async (
    req: Request<{}, {}, CreateVendorInput['body']>,
    res: Response
) => {
    try {
        const vendor = await createVendorService(req.body)
        await createAuditLog({
            action: 'vendor.create',
            resourceType: 'vendor',
            resourceId: vendor.id,
            actorId: res.locals.user?.id,
            message: 'Vendor created',
            success: true,
            req,
        })
        res.status(201).json(vendor)
    } catch (e) {
        await createAuditLog({
            action: 'vendor.create',
            resourceType: 'vendor',
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Create vendor failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleUpdateVendorRequest = async (
    req: Request<{}, {}, UpdateVendorInput['body']>,
    res: Response
) => {
    try {
        const vendor = await updateVendorService(req.body)
        await createAuditLog({
            action: 'vendor.update',
            resourceType: 'vendor',
            resourceId: vendor.id,
            actorId: res.locals.user?.id,
            message: 'Vendor updated',
            success: true,
            req,
        })
        res.status(200).json(vendor)
    } catch (e) {
        await createAuditLog({
            action: 'vendor.update',
            resourceType: 'vendor',
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Update vendor failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleDeleteVendorRequest = async (
    req: Request<DeleteVendorInput['params'], {}, {}>,
    res: Response
) => {
    const id = req.params?.id
    try {
        const vendor = await deleteVendorService(req.params)
        await createAuditLog({
            action: 'vendor.delete',
            resourceType: 'vendor',
            resourceId: id,
            actorId: res.locals.user?.id,
            message: 'Vendor deleted',
            success: true,
            req,
        })
        res.status(200).json(vendor)
    } catch (e) {
        await createAuditLog({
            action: 'vendor.delete',
            resourceType: 'vendor',
            resourceId: id,
            actorId: res.locals.user?.id,
            message: e instanceof Error ? e.message : 'Delete vendor failed',
            success: false,
            req,
        })
        return sendError(res, 400, e)
    }
}

export const handleGetVendorRequest = async (
    req: Request<GetVendorInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const vendor = await getVendorService(req.params)
        res.status(200).json(vendor)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleGetVendorsRequest = async (
    req: Request<{}, {}, {}, GetVendorsInput['query']>,
    res: Response
) => {
    try {
        const vendors = await getVendorsService(req.query)
        res.status(200).json(vendors)
    } catch (e) {
        return sendError(res, 400, e)
    }
}

export const handleGetVendorMenuRequest = async (
    req: Request<GetVendorMenuInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const menuItems = await getVendorMenuService(req.params)
        res.status(200).json(menuItems)
    } catch (e) {
        return sendError(res, 400, e)
    }
}
