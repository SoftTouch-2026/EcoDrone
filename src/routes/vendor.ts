import { Router } from 'express'
import { requireUser } from '../middlewares/requireUser'
import { requireVendor } from '../middlewares/requireVendor'
import { validateResource } from '../middlewares/validateResource'
import {
    handleGetVendorMeRequest,
    handleGetVendorMeMenuRequest,
    handleCreateVendorMeMenuRequest,
    handleUpdateVendorMeMenuRequest,
    handleDeleteVendorMeMenuRequest,
    handleGetVendorMeOrdersRequest,
    handleFulfillVendorMeOrderRequest,
    handleFulfillVendorMeOrderItemRequest,
} from '../controllers/vendor.controllers'
import {
    VendorMeMenuCreateSchema,
    VendorMeMenuUpdateSchema,
    VendorMeMenuDeleteSchema,
    VendorMeOrdersSchema,
    VendorMeOrderFulfillSchema,
    VendorMeOrderItemFulfillSchema,
} from '../schemas/vendor.schemas'

export const vendorMeRoutes = () => {
    const router = Router()

    router.use(requireUser)
    router.use(requireVendor)

    /**
     * @openapi
     * /vendor/me:
     *   get:
     *     tags:
     *       - Vendor
     *     summary: Get current vendor profile
     *     description: Returns the vendor associated with the authenticated user (vendor account required).
     *     operationId: handleGetVendorMeRequest
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Vendor profile
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 name:
     *                   type: string
     *                 location_id:
     *                   type: string
     *                   nullable: true
     *                 hours:
     *                   type: string
     *                   nullable: true
     *                 description:
     *                   type: string
     *                   nullable: true
     *                 momo_number:
     *                   type: string
     *                   nullable: true
     *                 locations:
     *                   type: object
     *                   nullable: true
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Vendor account required
     *       404:
     *         description: Vendor not found
     */
    router.get('/me', handleGetVendorMeRequest)

    /**
     * @openapi
     * /vendor/me/menu:
     *   get:
     *     tags:
     *       - Vendor
     *     summary: Get current vendor menu
     *     description: Returns all menu items for the current vendor.
     *     operationId: handleGetVendorMeMenuRequest
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of menu items
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Vendor account required
     */
    router.get('/me/menu', handleGetVendorMeMenuRequest)

    /**
     * @openapi
     * /vendor/me/menu:
     *   post:
     *     tags:
     *       - Vendor
     *     summary: Create a menu item for current vendor
     *     description: Creates a new menu item owned by the current vendor.
     *     operationId: handleCreateVendorMeMenuRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - unit_cost
     *             properties:
     *               name:
     *                 type: string
     *               unit_cost:
     *                 type: number
     *               description:
     *                 type: string
     *               thumbnail:
     *                 type: string
     *     responses:
     *       201:
     *         description: Menu item created
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Vendor account required
     */
    router.post(
        '/me/menu',
        validateResource(VendorMeMenuCreateSchema),
        handleCreateVendorMeMenuRequest
    )

    /**
     * @openapi
     * /vendor/me/menu/{id}:
     *   patch:
     *     tags:
     *       - Vendor
     *     summary: Update a menu item for current vendor
     *     description: Updates an existing menu item that belongs to the current vendor.
     *     operationId: handleUpdateVendorMeMenuRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               unit_cost:
     *                 type: number
     *               description:
     *                 type: string
     *               thumbnail:
     *                 type: string
     *     responses:
     *       200:
     *         description: Menu item updated
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Vendor account required
     *       404:
     *         description: Menu item not found
     */
    router.patch(
        '/me/menu/:id',
        validateResource(VendorMeMenuUpdateSchema),
        handleUpdateVendorMeMenuRequest
    )

    /**
     * @openapi
     * /vendor/me/menu/{id}:
     *   delete:
     *     tags:
     *       - Vendor
     *     summary: Delete a menu item for current vendor
     *     description: Deletes an existing menu item that belongs to the current vendor.
     *     operationId: handleDeleteVendorMeMenuRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: Menu item deleted
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Vendor account required
     *       404:
     *         description: Menu item not found
     */
    router.delete(
        '/me/menu/:id',
        validateResource(VendorMeMenuDeleteSchema),
        handleDeleteVendorMeMenuRequest
    )

    /**
     * @openapi
     * /vendor/me/orders:
     *   get:
     *     tags:
     *       - Vendor
     *     summary: List orders for current vendor
     *     description: Returns a paginated list of orders that contain at least one order item belonging to the current vendor. Each order only includes this vendor's items in its order_item array.
     *     operationId: handleGetVendorMeOrdersRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         required: false
     *         schema:
     *           type: string
     *       - in: query
     *         name: limit
     *         required: false
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Paginated list of vendor orders
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         format: uuid
     *                       status:
     *                         type: string
     *                       pickup_location:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             format: uuid
     *                           name:
     *                             type: string
     *                             nullable: true
     *                       dropoff_location:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             format: uuid
     *                           name:
     *                             type: string
     *                             nullable: true
     *                       customer:
     *                         type: object
     *                         nullable: true
     *                         properties:
     *                           id:
     *                             type: string
     *                             format: uuid
     *                           email:
     *                             type: string
     *                           first_name:
     *                             type: string
     *                             nullable: true
     *                           last_name:
     *                             type: string
     *                             nullable: true
     *                       created_at:
     *                         type: string
     *                         format: date-time
     *                       updated_at:
     *                         type: string
     *                         format: date-time
     *                       order_item:
     *                         type: array
     *                         items:
     *                           type: object
     *                           properties:
     *                             id:
     *                               type: string
     *                               format: uuid
     *                             order_id:
     *                               type: string
     *                               format: uuid
     *                               nullable: true
     *                             item_id:
     *                               type: string
     *                               format: uuid
     *                               nullable: true
     *                             order_quantity:
     *                               type: integer
     *                               nullable: true
     *                             vendor_fulfilled_at:
     *                               type: string
     *                               format: date-time
     *                               nullable: true
     *                             menu:
     *                               type: object
     *                               nullable: true
     *                               properties:
     *                                 id:
     *                                   type: string
     *                                   format: uuid
     *                                 name:
     *                                   type: string
     *                                   nullable: true
     *                                 unit_cost:
     *                                   type: number
     *                                 thumbnail_url:
     *                                   type: string
     *                                   nullable: true
     *                 total:
     *                   type: integer
     *                 page:
     *                   type: integer
     *                 limit:
     *                   type: integer
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Vendor account required
     */
    router.get(
        '/me/orders',
        validateResource(VendorMeOrdersSchema),
        handleGetVendorMeOrdersRequest
    )

    /**
     * @openapi
     * /vendor/me/orders/{orderId}/fulfill:
     *   post:
     *     tags:
     *       - Vendor
     *     summary: Mark all items for this vendor in an order as fulfilled
     *     description: Sets vendor_fulfilled_at for all order items in the order that belong to the current vendor.
     *     operationId: handleFulfillVendorMeOrderRequestPost
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: orderId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: Order items for this vendor marked fulfilled
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 status:
     *                   type: string
     *                 pickup_location:
     *                   type: string
     *                   format: uuid
     *                 dropoff_location:
     *                   type: string
     *                   format: uuid
     *                 assigned_drone:
     *                   type: string
     *                   format: uuid
     *                   nullable: true
     *                 customer_id:
     *                   type: string
     *                   format: uuid
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Vendor account required or no items for this vendor
     *       404:
     *         description: Order not found
     */
    router.post(
        '/me/orders/:orderId/fulfill',
        validateResource(VendorMeOrderFulfillSchema),
        handleFulfillVendorMeOrderRequest
    )

    /**
     * @openapi
     * /vendor/me/orders/{orderId}/fulfill:
     *   patch:
     *     tags:
     *       - Vendor
     *     summary: Mark all items for this vendor in an order as fulfilled (alias)
     *     description: Same as POST /vendor/me/orders/{orderId}/fulfill.
     *     operationId: handleFulfillVendorMeOrderRequestPatch
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: orderId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: Order items for this vendor marked fulfilled
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 status:
     *                   type: string
     *                 pickup_location:
     *                   type: string
     *                   format: uuid
     *                 dropoff_location:
     *                   type: string
     *                   format: uuid
     *                 assigned_drone:
     *                   type: string
     *                   format: uuid
     *                   nullable: true
     *                 customer_id:
     *                   type: string
     *                   format: uuid
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Vendor account required or no items for this vendor
     *       404:
     *         description: Order not found
     */
    router.patch(
        '/me/orders/:orderId/fulfill',
        validateResource(VendorMeOrderFulfillSchema),
        handleFulfillVendorMeOrderRequest
    )

    /**
     * @openapi
     * /vendor/me/orders/{orderId}/items/{orderItemId}/fulfill:
     *   patch:
     *     tags:
     *       - Vendor
     *     summary: Mark a single order item for this vendor as fulfilled
     *     description: Sets vendor_fulfilled_at for one order_item that belongs to the given order and to the current vendor.
     *     operationId: handleFulfillVendorMeOrderItemRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: orderId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: path
     *         name: orderItemId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: Order item marked fulfilled
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 order_id:
     *                   type: string
     *                   format: uuid
     *                   nullable: true
     *                 item_id:
     *                   type: string
     *                   format: uuid
     *                   nullable: true
     *                 order_quantity:
     *                   type: integer
     *                   nullable: true
     *                 vendor_fulfilled_at:
     *                   type: string
     *                   format: date-time
     *                   nullable: true
     *                 menu:
     *                   type: object
     *                   nullable: true
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     name:
     *                       type: string
     *                       nullable: true
     *                     unit_cost:
     *                       type: number
     *                     thumbnail_url:
     *                       type: string
     *                       nullable: true
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Vendor account required or item does not belong to vendor
     *       404:
     *         description: Order item not found
     */
    router.patch(
        '/me/orders/:orderId/items/:orderItemId/fulfill',
        validateResource(VendorMeOrderItemFulfillSchema),
        handleFulfillVendorMeOrderItemRequest
    )

    return router
}
