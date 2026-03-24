import { Router } from 'express'
import {
    handleCreateOrderItemRequest,
    handleUpdateOrderItemRequest,
    handleDeleteOrderItemRequest,
    handleGetOrderItemsRequest,
} from '../controllers/orderItem.controllers'
import { validateResource } from '../middlewares/validateResource'
import {
    CreateOrderItemSchema,
    UpdateOrderItemSchema,
    DeleteOrderItemSchema,
    GetOrderItemsSchema,
} from '../schemas/orderItem.schemas'
import { requireUser } from '../middlewares/requireUser'

export const orderItemRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /orderItem/createOrderItem:
     *   post:
     *     tags:
     *       - Order Items
     *     summary: Create order item
     *     description: Add an item to an order with quantity
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - order_id
     *               - item_id
     *               - order_quantity
     *             properties:
     *               order_id:
     *                 type: string
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               item_id:
     *                 type: string
     *                 example: 660e8400-e29b-41d4-a716-446655440001
     *               order_quantity:
     *                 type: number
     *                 minimum: 1
     *                 example: 3
     *     responses:
     *       201:
     *         description: Order item created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/createOrderItem', [
        requireUser,
        validateResource(CreateOrderItemSchema),
        handleCreateOrderItemRequest,
    ])

    /**
     * @openapi
     * /orderItem/updateOrderItem:
     *   post:
     *     tags:
     *       - Order Items
     *     summary: Update order item quantity
     *     description: Update the quantity of an item in an order
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
     *               - order_quantity
     *             properties:
     *               id:
     *                 type: string
     *               order_quantity:
     *                 type: number
     *                 minimum: 1
     *     responses:
     *       200:
     *         description: Order item updated successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/updateOrderItem', [
        requireUser,
        validateResource(UpdateOrderItemSchema),
        handleUpdateOrderItemRequest,
    ])

    /**
     * @openapi
     * /orderItem/deleteOrderItem:
     *   delete:
     *     tags:
     *       - Order Items
     *     summary: Delete order item
     *     description: Remove an item from an order
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Order item ID
     *     responses:
     *       200:
     *         description: Order item deleted successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.delete('/deleteOrderItem', [
        requireUser,
        validateResource(DeleteOrderItemSchema),
        handleDeleteOrderItemRequest,
    ])

    /**
     * @openapi
     * /orderItem/getOrderItems:
     *   get:
     *     tags:
     *       - Order Items
     *     summary: Get all items in order
     *     description: Retrieve all items in a specific order
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: order_id
     *         required: true
     *         schema:
     *           type: string
     *         description: Order ID
     *     responses:
     *       200:
     *         description: Order items retrieved successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getOrderItems', [
        requireUser,
        validateResource(GetOrderItemsSchema),
        handleGetOrderItemsRequest,
    ])

    return router
}
