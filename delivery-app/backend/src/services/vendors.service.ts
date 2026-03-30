import { prisma } from '../utils/connect'
import {
    CreateVendorInput,
    UpdateVendorInput,
    DeleteVendorInput,
    GetVendorInput,
    GetVendorsInput,
    GetVendorMenuInput,
} from '../utils/types'

export const createVendorService = async (data: CreateVendorInput['body']) => {
    try {
        const {
            name,
            location_id,
            hours,
            description,
            emoji,
            momo_number,
            thumbnail_url,
        } =
            data
        const vendor = await prisma.vendors.create({
            data: {
                name,
                location_id: location_id as string,
                hours: hours as string,
                description: description as string,
                momo_number: momo_number as string,
                thumbnail_url: thumbnail_url as string,
            },
        })
        return vendor
    } catch (e) {
        throw e
    }
}

export const updateVendorService = async (data: UpdateVendorInput['body']) => {
    try {
        const { id, ...updateData } = data
        const vendor = await prisma.vendors.update({
            where: {
                id: id,
            },
            data: {
                name: updateData.name as string,
                location_id: updateData.location_id as string,
                hours: updateData.hours as string,
                description: updateData.description as string,
                momo_number: updateData.momo_number as string,
                thumbnail_url: updateData.thumbnail_url as string,
            },
        })
        return vendor
    } catch (e) {
        throw e
    }
}

export const deleteVendorService = async (
    data: DeleteVendorInput['params']
) => {
    try {
        const { id } = data
        const vendor = await prisma.vendors.delete({
            where: {
                id,
            },
        })
        return vendor
    } catch (e) {
        throw e
    }
}

export const getVendorService = async (data: GetVendorInput['params']) => {
    try {
        const { id } = data
        const vendor = await prisma.vendors.findUnique({
            where: {
                id,
            },
            include: {
                locations: true,
            },
        })
        return vendor
    } catch (e) {
        console.log(e)
        throw e
    }
}

export const getVendorsService = async (data: GetVendorsInput['query']) => {
    try {
        const page = parseInt(data.page || '1', 10)
        const limit = parseInt(data.limit || '10', 10)
        const skip = (page - 1) * limit
        const where = {}
        const [vendors, total] = await Promise.all([
            prisma.vendors.findMany({
                where,
                skip,
                take: limit,
                include: { locations: true },
            }),
            prisma.vendors.count({ where }),
        ])
        return { data: vendors, total, page, limit }
    } catch (e) {
        console.log(e)
        throw e
    }
}

export const getVendorMenuService = async (
    data: GetVendorMenuInput['params']
) => {
    try {
        const { vendorId } = data
        const menuItems = await prisma.menu.findMany({
            where: {
                vendor_id: vendorId,
                available: true,
            },
        })
        return menuItems
    } catch (e) {
        throw e
    }
}
