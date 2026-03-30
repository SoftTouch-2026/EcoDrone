import { Router } from 'express'
import {
    handleCreateCartRequest,
    handleDeleteCartRequest,
    handleGetCartRequest,
    handleGetCartByUserRequest,
} from '../controllers/cart.controllers'
import { validateResource } from '../middlewares/validateResource'
import {
    CreateCartSchema,
    DeleteCartSchema,
    GetCartSchema,
    GetCartByUserSchema,
} from '../schemas/cart.schemas'
import { requireUser } from '../middlewares/requireUser'

export const cartRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /cart/createCart:
     *   post:
     *     tags:
     *       - Cart
     *     summary: Create a new cart
     *     description: Create a shopping cart for a user
     *     operationId: handleCreateCartRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_id
     *             properties:
     *               user_id:
     *                 type: string
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *     responses:
     *       201:
     *         description: Cart created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/createCart', [
        requireUser,
        validateResource(CreateCartSchema),
        handleCreateCartRequest,
    ])

    /**
     * @openapi
     * /cart/deleteCart/{id}:
     *   delete:
     *     tags:
     *       - Cart
     *     summary: Delete a cart
     *     description: Remove a cart and all its items
     *     operationId: handleDeleteCartRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Cart ID
     *     responses:
     *       200:
     *         description: Cart deleted successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.delete('/deleteCart/:id', [
        requireUser,
        validateResource(DeleteCartSchema),
        handleDeleteCartRequest,
    ])

    /**
     * @openapi
     * /cart/getCart/{id}:
     *   get:
     *     tags:
     *       - Cart
     *     summary: Get cart by ID
     *     description: Retrieve cart details including all items
     *     operationId: handleGetCartRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Cart ID
     *     responses:
     *       200:
     *         description: Cart retrieved successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getCart/:id', [
        requireUser,
        validateResource(GetCartSchema),
        handleGetCartRequest,
    ])

    /**
     * @openapi
     * /cart/getCartByUser/{userId}:
     *   get:
     *     tags:
     *       - Cart
     *     summary: Get cart by user ID
     *     description: Retrieve a user's cart with all items
     *     operationId: handleGetCartByUserRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: User ID
     *     responses:
     *       200:
     *         description: Cart retrieved successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getCartByUser/:userId', [
        requireUser,
        validateResource(GetCartByUserSchema),
        handleGetCartByUserRequest,
    ])

    return router
}
