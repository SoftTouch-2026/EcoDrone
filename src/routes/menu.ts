import { Router } from 'express'
import {
    handleCreateMenuRequest,
    handleUpdateMenuRequest,
    handleDeleteMenuRequest,
    handleGetMenuRequest,
    handleGetMenusRequest,
} from '../controllers/menu.controllers'
import { validateResource } from '../middlewares/validateResource'
import {
    CreateMenuSchema,
    UpdateMenuSchema,
    DeleteMenuSchema,
    GetMenuSchema,
    GetMenusSchema,
} from '../schemas/menu.schemas'
import { requireUser } from '../middlewares/requireUser'

export const menuRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /menu/createMenu:
     *   post:
     *     tags:
     *       - Menu
     *     summary: Create a new menu item
     *     description: Add a new item to the menu with name, price, and optional description
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
     *                 example: Eco Package Delivery
     *               unit_cost:
     *                 type: number
     *                 example: 25.99
     *               description:
     *                 type: string
     *                 example: Standard eco-friendly package delivery
     *               thumbnail:
     *                 type: string
     *                 example: https://example.com/image.jpg
     *     responses:
     *       201:
     *         description: Menu item created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/createMenu', [
        requireUser,
        validateResource(CreateMenuSchema),
        handleCreateMenuRequest,
    ])

    /**
     * @openapi
     * /menu/updateMenu:
     *   post:
     *     tags:
     *       - Menu
     *     summary: Update menu item
     *     description: Update details of an existing menu item
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
     *               - name
     *               - unit_cost
     *             properties:
     *               id:
     *                 type: string
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
     *         description: Menu item updated successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/updateMenu', [
        requireUser,
        validateResource(UpdateMenuSchema),
        handleUpdateMenuRequest,
    ])

    /**
     * @openapi
     * /menu/deleteMenu:
     *   delete:
     *     tags:
     *       - Menu
     *     summary: Delete menu item
     *     description: Remove a menu item from the system
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Menu item ID
     *     responses:
     *       200:
     *         description: Menu item deleted successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.delete('/deleteMenu', [
        requireUser,
        validateResource(DeleteMenuSchema),
        handleDeleteMenuRequest,
    ])

    /**
     * @openapi
     * /menu/getMenu:
     *   get:
     *     tags:
     *       - Menu
     *     summary: Get single menu item
     *     description: Retrieve details of a specific menu item
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Menu item ID
     *     responses:
     *       200:
     *         description: Menu item retrieved successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getMenu', [
        requireUser,
        validateResource(GetMenuSchema),
        handleGetMenuRequest,
    ])

    /**
     * @openapi
     * /menu/getMenus:
     *   get:
     *     tags:
     *       - Menu
     *     summary: Get paginated list of menu items
     *     description: Retrieve all menu items with pagination
     *     security:
     *       - bearerAuth: []
     *     parameters:
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
     *         description: Menu items retrieved successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getMenus', [
        requireUser,
        validateResource(GetMenusSchema),
        handleGetMenusRequest,
    ])

    return router
}
