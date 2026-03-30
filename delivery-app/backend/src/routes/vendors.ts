import { Router } from 'express'
import {
    handleCreateVendorRequest,
    handleUpdateVendorRequest,
    handleDeleteVendorRequest,
    handleGetVendorRequest,
    handleGetVendorsRequest,
    handleGetVendorMenuRequest,
} from '../controllers/vendors.controllers'
import { validateResource } from '../middlewares/validateResource'
import {
    CreateVendorSchema,
    UpdateVendorSchema,
    DeleteVendorSchema,
    GetVendorSchema,
    GetVendorsSchema,
    GetVendorMenuSchema,
} from '../schemas/vendors.schemas'
import { requireUser } from '../middlewares/requireUser'
import { requireAdmin } from '../middlewares/requireAdmin'

export const vendorRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /vendors/createVendor:
     *   post:
     *     tags:
     *       - Vendors
     *     summary: Create a new vendor
     *     description: Add a new cafeteria or shop vendor to the system
     *     operationId: handleCreateVendorRequest
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
     *             properties:
     *               name:
     *                 type: string
     *                 example: Akornor Cafeteria
     *               location_id:
     *                 type: string
     *                 example: hive-location
     *               hours:
     *                 type: string
     *                 example: 7:00 AM – 8:00 PM
     *               description:
     *                 type: string
     *                 example: Main campus dining — Jollof, Banku, local favorites
     *               emoji:
     *                 type: string
     *                 example: 🍛
     *               momo_number:
     *                 type: string
     *                 example: 024 123 4567
     *               thumbnail_url:
     *                 type: string
     *                 nullable: true
     *                 example: https://example.com/vendors/akornor.jpg
     *     responses:
     *       201:
     *         description: Vendor created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/createVendor', [
        requireUser,
        requireAdmin,
        validateResource(CreateVendorSchema),
        handleCreateVendorRequest,
    ])

    /**
     * @openapi
     * /vendors/updateVendor:
     *   post:
     *     tags:
     *       - Vendors
     *     summary: Update vendor details
     *     description: Update information for an existing vendor
     *     operationId: handleUpdateVendorRequest
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
     *             properties:
     *               id:
     *                 type: string
     *               name:
     *                 type: string
     *               location_id:
     *                 type: string
     *               hours:
     *                 type: string
     *               description:
     *                 type: string
     *               emoji:
     *                 type: string
     *               momo_number:
     *                 type: string
     *               thumbnail_url:
     *                 type: string
     *                 nullable: true
     *     responses:
     *       200:
     *         description: Vendor updated successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/updateVendor', [
        requireUser,
        requireAdmin,
        validateResource(UpdateVendorSchema),
        handleUpdateVendorRequest,
    ])

    /**
     * @openapi
     * /vendors/deleteVendor/{id}:
     *   delete:
     *     tags:
     *       - Vendors
     *     summary: Delete a vendor
     *     description: Remove a vendor from the system
     *     operationId: handleDeleteVendorRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Vendor ID
     *     responses:
     *       200:
     *         description: Vendor deleted successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.delete('/deleteVendor/:id', [
        requireUser,
        requireAdmin,
        validateResource(DeleteVendorSchema),
        handleDeleteVendorRequest,
    ])

    /**
     * @openapi
     * /vendors/getVendor/{id}:
     *   get:
     *     tags:
     *       - Vendors
     *     summary: Get single vendor
     *     description: Retrieve details of a specific vendor by ID
     *     operationId: handleGetVendorRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Vendor ID
     *     responses:
     *       200:
     *         description: Vendor details retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 name:
     *                   type: string
     *                 location_id:
     *                   type: string
     *                 hours:
     *                   type: string
     *                 description:
     *                   type: string
     *                 emoji:
     *                   type: string
     *                 momo_number:
     *                   type: string
     *                 thumbnail_url:
     *                   type: string
     *                   nullable: true
     *                 locations:
     *                   type: object
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getVendor/:id', [
        requireUser,
        validateResource(GetVendorSchema),
        handleGetVendorRequest,
    ])

    /**
     * @openapi
     * /vendors/getVendors:
     *   get:
     *     tags:
     *       - Vendors
     *     summary: Get paginated list of vendors
     *     description: Retrieve a paginated list of all vendors
     *     operationId: handleGetVendorsRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: pathf
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Vendor ID
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
     *         description: List of vendors retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   name:
     *                     type: string
     *                   location_id:
     *                     type: string
     *                   hours:
     *                     type: string
     *                   description:
     *                     type: string
     *                   emoji:
     *                     type: string
     *                   momo_number:
     *                     type: string
     *                   thumbnail_url:
     *                     type: string
     *                     nullable: true
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getVendors', [
        requireUser,
        validateResource(GetVendorsSchema),
        handleGetVendorsRequest,
    ])

    /**
     * @openapi
     * /vendors/getVendorMenu/{vendorId}:
     *   get:
     *     tags:
     *       - Vendors
     *     summary: Get vendor menu items
     *     description: Retrieve all available menu items for a specific vendor
     *     operationId: handleGetVendorMenuRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: vendorId
     *         required: true
     *         schema:
     *           type: string
     *         description: Vendor ID
     *     responses:
     *       200:
     *         description: Menu items retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   vendor_id:
     *                     type: string
     *                   name:
     *                     type: string
     *                   category:
     *                     type: string
     *                     enum: [food, drinks, snacks, desserts, stationery, electronics]
     *                   unit_cost:
     *                     type: number
     *                   description:
     *                     type: string
     *                   thumbnail_url:
     *                     type: string
     *                   available:
     *                     type: boolean
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getVendorMenu/:vendorId', [
        requireUser,
        validateResource(GetVendorMenuSchema),
        handleGetVendorMenuRequest,
    ])

    return router
}
