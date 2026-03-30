import { Router } from 'express'
import {
    handleCreateOrderRequest,
    handleUpdateOrderRequest,
    handleDeleteOrderRequest,
    handleGetOrderRequest,
    handleGetOrdersRequest,
} from '../controllers/orders.controllers'
import { validateResource } from '../middlewares/validateResource'
import {
    CreateOrderSchema,
    UpdateOrderSchema,
    DeleteOrderSchema,
    GetOrderSchema,
    GetOrdersSchema,
} from '../schemas/orders.schemas'
import { requireUser } from '../middlewares/requireUser'

export const orderRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /orders/createOrder:
     *   post:
     *     tags:
     *       - Orders
     *     summary: Create a new order
     *     description: Create a delivery order with pickup and dropoff locations
     *     operationId: handleCreateOrderRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - pickup_location
     *               - dropoff_location
     *               - assigned_drone
     *               - customer_id
     *             properties:
     *               pickup_location:
     *                 type: string
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               dropoff_location:
     *                 type: string
     *                 example: 660e8400-e29b-41d4-a716-446655440001
     *               assigned_drone:
     *                 type: string
     *                 example: 770e8400-e29b-41d4-a716-446655440002
     *               customer_id:
     *                 type: string
     *                 example: 880e8400-e29b-41d4-a716-446655440003
     *     responses:
     *       201:
     *         description: Order created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/createOrder', [
        requireUser,
        validateResource(CreateOrderSchema),
        handleCreateOrderRequest,
    ])

    /**
     * @openapi
     * /orders/updateOrder:
     *   post:
     *     tags:
     *       - Orders
     *     summary: Update order details
     *     description: Update pickup/dropoff locations and assigned drone for an order
     *     operationId: handleUpdateOrderRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - pickup_location
     *               - dropoff_location
     *               - assigned_drone
     *               - customer_id
     *             properties:
     *               pickup_location:
     *                 type: string
     *               dropoff_location:
     *                 type: string
     *               assigned_drone:
     *                 type: string
     *               customer_id:
     *                 type: string
     *     responses:
     *       200:
     *         description: Order updated successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/updateOrder', [
        requireUser,
        validateResource(UpdateOrderSchema),
        handleUpdateOrderRequest,
    ])

    /**
     * @openapi
     * /orders/deleteOrder/{id}:
     *   delete:
     *     tags:
     *       - Orders
     *     summary: Delete an order
     *     description: Remove an order from the system
     *     operationId: handleDeleteOrderRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Order ID
     *     responses:
     *       200:
     *         description: Order deleted successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.delete('/deleteOrder/:id', [
        requireUser,
        validateResource(DeleteOrderSchema),
        handleDeleteOrderRequest,
    ])

    /**
     * @openapi
     * /orders/getOrder/{id}:
     *   get:
     *     tags:
     *       - Orders
     *     summary: Get single order
     *     description: Retrieve details of a specific order by ID
     *     operationId: handleGetOrderRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Order ID
     *     responses:
     *       200:
     *         description: Order details retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 pickup_location:
     *                   type: string
     *                 dropoff_location:
     *                   type: string
     *                 assigned_drone:
     *                   type: string
     *                 customer_id:
     *                   type: string
     *                 status:
     *                   type: string
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getOrder/:id', [
        requireUser,
        validateResource(GetOrderSchema),
        handleGetOrderRequest,
    ])

    /**
     * @openapi
     * /orders/getOrders:
     *   get:
     *     tags:
     *       - Orders
     *     summary: Get paginated list of orders
     *     description: Retrieve a paginated list of all orders
     *     operationId: handleGetOrdersRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: user_id
     *         required: false
     *         schema:
     *           type: string
     *         example: "770e8400-e29b-41d4-a716-446655440002"
     *       - in: query
     *         name: page
     *         required: true
     *         schema:
     *           type: string
     *         example: "1"
     *       - in: query
     *         name: limit
     *         required: true
     *         schema:
     *           type: string
     *         example: "10"
     *     responses:
     *       200:
     *         description: List of orders retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   pickup_location:
     *                     type: string
     *                   dropoff_location:
     *                     type: string
     *                   assigned_drone:
     *                     type: string
     *                   status:
     *                     type: string
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getOrders', [
        requireUser,
        validateResource(GetOrdersSchema),
        handleGetOrdersRequest,
    ])

    return router
}
