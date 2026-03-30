import { Router } from 'express'
import {
    handleCreateLocationRequest,
    handleUpdateLocationRequest,
    handleDeleteLocationRequest,
    handleGetLocationRequest,
    handleGetLocationsRequest,
} from '../controllers/locations.controllers'
import { validateResource } from '../middlewares/validateResource'
import {
    CreateLocationSchema,
    UpdateLocationSchema,
    DeleteLocationSchema,
    GetLocationSchema,
    GetLocationsSchema,
} from '../schemas/locations.schemas'
import { requireUser } from '../middlewares/requireUser'

export const locationRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /locations/createLocation:
     *   post:
     *     tags:
     *       - Locations
     *     summary: Create a new location
     *     description: Add a new delivery location with coordinates
     *     operationId: handleCreateLocationRequest
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
     *               - latitude
     *               - longitude
     *             properties:
     *               name:
     *                 type: string
     *                 example: Downtown Hub
     *               latitude:
     *                 type: number
     *                 example: 40.7128
     *               longitude:
     *                 type: number
     *                 example: -74.0060
     *     responses:
     *       201:
     *         description: Location created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/createLocation', [
        requireUser,
        validateResource(CreateLocationSchema),
        handleCreateLocationRequest,
    ])

    /**
     * @openapi
     * /locations/updateLocation:
     *   post:
     *     tags:
     *       - Locations
     *     summary: Update location details
     *     description: Update coordinates and name of an existing location
     *     operationId: handleUpdateLocationRequest
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
     *               - latitude
     *               - longitude
     *             properties:
     *               id:
     *                 type: string
     *               name:
     *                 type: string
     *               latitude:
     *                 type: number
     *               longitude:
     *                 type: number
     *     responses:
     *       200:
     *         description: Location updated successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/updateLocation', [
        requireUser,
        validateResource(UpdateLocationSchema),
        handleUpdateLocationRequest,
    ])

    /**
     * @openapi
     * /locations/deleteLocation/{id}:
     *   delete:
     *     tags:
     *       - Locations
     *     summary: Delete a location
     *     description: Remove a location from the system
     *     operationId: handleDeleteLocationRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Location ID
     *     responses:
     *       200:
     *         description: Location deleted successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.delete('/deleteLocation/:id', [
        requireUser,
        validateResource(DeleteLocationSchema),
        handleDeleteLocationRequest,
    ])

    /**
     * @openapi
     * /locations/getLocation/{id}:
     *   get:
     *     tags:
     *       - Locations
     *     summary: Get single location
     *     description: Retrieve details of a specific location by ID
     *     operationId: handleGetLocationRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Location ID
     *     responses:
     *       200:
     *         description: Location details retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 name:
     *                   type: string
     *                 latitude:
     *                   type: number
     *                 longitude:
     *                   type: number
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getLocation/:id', [
        requireUser,
        validateResource(GetLocationSchema),
        handleGetLocationRequest,
    ])

    /**
     * @openapi
     * /locations/getLocations:
     *   get:
     *     tags:
     *       - Locations
     *     summary: Get paginated list of locations
     *     description: Retrieve a paginated list of all locations
     *     operationId: handleGetLocationsRequest
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
     *         description: List of locations retrieved successfully
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
     *                   latitude:
     *                     type: number
     *                   longitude:
     *                     type: number
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getLocations', [
        requireUser,
        validateResource(GetLocationsSchema),
        handleGetLocationsRequest,
    ])

    return router
}
