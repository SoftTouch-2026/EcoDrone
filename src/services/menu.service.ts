import { prisma } from '../utils/connect'
import {
    CreateMenuInput,
    UpdateMenuInput,
    DeleteMenuInput,
    GetMenuInput,
    GetMenusInput,
} from '../utils/types'

export const createMenuService = async (data: CreateMenuInput['body']) => {
    try {
        const { name, unit_cost, description, thumbnail } = data
        const menu = await prisma.menu.create({
            data: {
                name: name || '',
                unit_cost: unit_cost || 0,
                description: description || '',
                thumbnail: thumbnail || '',
            },
        })
        return menu
    } catch (e) {
        throw e
    }
}

export const updateMenuService = async (data: UpdateMenuInput['body']) => {
    try {
        const { id, name, unit_cost, description, thumbnail } = data
        const menu = await prisma.menu.update({
            where: {
                id,
            },
            data: {
                name: name || '',
                unit_cost: unit_cost || 0,
                description: description || '',
                thumbnail: thumbnail || '',
            },
        })
        return menu
    } catch (e) {
        throw e
    }
}

export const deleteMenuService = async (data: DeleteMenuInput['params']) => {
    try {
        const { id } = data
        const menu = await prisma.menu.delete({
            where: {
                id,
            },
        })
        return menu
    } catch (e) {
        throw e
    }
}

export const getMenuService = async (data: GetMenuInput['params']) => {
    try {
        const { id } = data
        const menu = await prisma.menu.findUnique({
            where: {
                id,
            },
        })
        return menu
    } catch (e) {
        throw e
    }
}

export const getMenusService = async (data: GetMenusInput['params']) => {
    try {
        const { page, limit } = data
        const menus = await prisma.menu.findMany({
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
        })
        return menus
    } catch (e) {
        throw e
    }
}
