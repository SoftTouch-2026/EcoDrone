import { Router } from 'express'
import {
    handleAddCartItemRequest,
    handleUpdateCartItemRequest,
    handleDeleteCartItemRequest,
    handleGetCartItemsRequest,
} from '../controllers/cartItem.controllers'
import { validateResource } from '../middlewares/validateResource'
import {
    AddCartItemSchema,
    UpdateCartItemSchema,
    DeleteCartItemSchema,
    GetCartItemsSchema,
} from '../schemas/cartItem.schemas'
import { requireUser } from '../middlewares/requireUser'

export const cartItemRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /cartItem/addCartItem:
     *   post:
     *     tags:
     *       - Cart Items
     *     summary: Add item to cart
     *     description: Add a menu item to the shopping cart with quantity
     *     operationId: handleAddCartItemRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - cart_id
     *               - item_id
     *               - quantity
     *             properties:
     *               cart_id:
     *                 type: string
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               item_id:
     *                 type: string
     *                 example: 660e8400-e29b-41d4-a716-446655440001
     *               quantity:
     *                 type: number
     *                 minimum: 1
     *                 example: 2
     *     responses:
     *       201:
     *         description: Item added to cart successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/addCartItem', [
        requireUser,
        validateResource(AddCartItemSchema),
        handleAddCartItemRequest,
    ])

    /**
     * @openapi
     * /cartItem/updateCartItem:
     *   post:
     *     tags:
     *       - Cart Items
     *     summary: Update cart item quantity
     *     description: Update the quantity of an item in the cart
     *     operationId: handleUpdateCartItemRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id
     *               - quantity
     *             properties:
     *               id:
     *                 type: string
     *               quantity:
     *                 type: number
     *                 minimum: 1
     *     responses:
     *       200:
     *         description: Cart item updated successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/updateCartItem', [
        requireUser,
        validateResource(UpdateCartItemSchema),
        handleUpdateCartItemRequest,
    ])

    /**
     * @openapi
     * /cartItem/deleteCartItem/{id}:
     *   delete:
     *     tags:
     *       - Cart Items
     *     summary: Remove item from cart
     *     description: Delete a specific item from the cart
     *     operationId: handleDeleteCartItemRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Cart item ID
     *     responses:
     *       200:
     *         description: Cart item deleted successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.delete('/deleteCartItem/:id', [
        requireUser,
        validateResource(DeleteCartItemSchema),
        handleDeleteCartItemRequest,
    ])

    /**
     * @openapi
     * /cartItem/getCartItems:
     *   get:
     *     tags:
     *       - Cart Items
     *     summary: Get all items in cart
     *     description: Retrieve all items in a specific cart
     *     operationId: handleGetCartItemsRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: cart_id
     *         required: true
     *         schema:
     *           type: string
     *         description: Cart ID
     *     responses:
     *       200:
     *         description: Cart items retrieved successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getCartItems', [
        requireUser,
        validateResource(GetCartItemsSchema),
        handleGetCartItemsRequest,
    ])

    return router
}
