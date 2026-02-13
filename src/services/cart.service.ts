import { prisma } from '../utils/connect'
import {
    CreateCartInput,
    DeleteCartInput,
    GetCartInput,
    GetCartByUserInput,
} from '../utils/types'

export const createCartService = async (data: CreateCartInput['body']) => {
    try {
        const { user_id } = data
        const cart = await prisma.cart.create({
            data: {
                user_id,
            },
        })
        return cart
    } catch (e) {
        throw e
    }
}

export const deleteCartService = async (data: DeleteCartInput['params']) => {
    try {
        const { id } = data
        const cart = await prisma.cart.delete({
            where: {
                id,
            },
        })
        return cart
    } catch (e) {
        throw e
    }
}

export const getCartService = async (data: GetCartInput['params']) => {
    try {
        const { id } = data
        const cart = await prisma.cart.findUnique({
            where: {
                id,
            },
            include: {
                cart_item: {
                    include: {
                        menu: true,
                    },
                },
            },
        })
        return cart
    } catch (e) {
        throw e
    }
}

export const getCartByUserService = async (
    data: GetCartByUserInput['params']
) => {
    try {
        const { user_id } = data
        const cart = await prisma.cart.findFirst({
            where: {
                user_id,
            },
            include: {
                cart_item: {
                    include: {
                        menu: true,
                    },
                },
            },
        })
        return cart
    } catch (e) {
        throw e
    }
}
