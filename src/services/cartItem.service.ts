import { prisma } from '../utils/connect'
import {
    AddCartItemInput,
    UpdateCartItemInput,
    DeleteCartItemInput,
    GetCartItemsInput,
} from '../utils/types'

export const addCartItemService = async (data: AddCartItemInput['body']) => {
    try {
        const { cart_id, item_id, quantity } = data
        const cartItem = await prisma.cart_item.create({
            data: {
                cart_id,
                item_id,
                quanity: quantity,
            },
        })
        return cartItem
    } catch (e) {
        throw e
    }
}

export const updateCartItemService = async (
    data: UpdateCartItemInput['body']
) => {
    try {
        const { id, quantity } = data
        const cartItem = await prisma.cart_item.update({
            where: {
                id,
            },
            data: {
                quanity: quantity,
            },
        })
        return cartItem
    } catch (e) {
        throw e
    }
}

export const deleteCartItemService = async (
    data: DeleteCartItemInput['params']
) => {
    try {
        const { id } = data
        const cartItem = await prisma.cart_item.delete({
            where: {
                id,
            },
        })
        return cartItem
    } catch (e) {
        throw e
    }
}

export const getCartItemsService = async (
    data: GetCartItemsInput['params']
) => {
    try {
        const { cart_id } = data
        const cartItems = await prisma.cart_item.findMany({
            where: {
                cart_id,
            },
            include: {
                menu: true,
            },
        })
        return cartItems
    } catch (e) {
        throw e
    }
}
