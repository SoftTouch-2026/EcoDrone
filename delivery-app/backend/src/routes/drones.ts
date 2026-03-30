import { Router } from 'express'
import {
    handleCreateDroneRequest,
    handleUpdateDroneRequest,
    handleDeleteDroneRequest,
    handleGetDroneRequest,
    handleGetDronesRequest,
    handleAssignDroneRequest,
} from '../controllers/drones.controllers'
import { validateResource } from '../middlewares/validateResource'
import {
    CreateDroneSchema,
    UpdateDroneSchema,
    DeleteDroneSchema,
    GetDroneSchema,
    GetDronesSchema,
    AssignDroneSchema,
} from '../schemas/drones.schemas'
import { requireUser } from '../middlewares/requireUser'
import { requireAdmin } from '../middlewares/requireAdmin'

export const droneRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /drones/createDrone:
     *   post:
     *     tags:
     *       - Drones
     *     summary: Create a new drone
     *     description: Register a new drone in the system with serial number and battery level
     *     operationId: handleCreateDroneRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - serial_number
     *               - battery_level
     *             properties:
     *               serial_number:
     *                 type: string
     *                 example: DRN-001-2024
     *               battery_level:
     *                 type: number
     *                 minimum: 0
     *                 maximum: 100
     *                 example: 95.5
     *     responses:
     *       201:
     *         description: Drone created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 serial_number:
     *                   type: string
     *                 battery_level:
     *                   type: number
     *                 status:
     *                   type: string
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized
     */
    router.post('/createDrone', [
        requireUser,
        requireAdmin,
        validateResource(CreateDroneSchema),
        handleCreateDroneRequest,
    ])

    /**
     * @openapi
     * /drones/updateDrone:
     *   post:
     *     tags:
     *       - Drones
     *     summary: Update drone battery level
     *     description: Update the battery level of an existing drone
     *     operationId: handleUpdateDroneRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - serial_number
     *               - battery_level
     *             properties:
     *               serial_number:
     *                 type: string
     *                 example: DRN-001-2024
     *               battery_level:
     *                 type: number
     *                 minimum: 0
     *                 maximum: 100
     *                 example: 75.0
     *     responses:
     *       200:
     *         description: Drone updated successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/updateDrone', [
        requireUser,
        requireAdmin,
        validateResource(UpdateDroneSchema),
        handleUpdateDroneRequest,
    ])

    /**
     * @openapi
     * /drones/deleteDrone/{id}:
     *   delete:
     *     tags:
     *       - Drones
     *     summary: Delete a drone
     *     description: Remove a drone from the system
     *     operationId: handleDeleteDroneRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Drone ID
     *     responses:
     *       200:
     *         description: Drone deleted successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.delete('/deleteDrone/:id', [
        requireUser,
        requireAdmin,
        validateResource(DeleteDroneSchema),
        handleDeleteDroneRequest,
    ])

    /**
     * @openapi
     * /drones/assignDrone:
     *   post:
     *     tags:
     *       - Drones
     *     summary: Assign drone to order
     *     description: Assign an available drone to a specific order
     *     operationId: handleAssignDroneRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - drone_id
     *               - order_id
     *             properties:
     *               drone_id:
     *                 type: string
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               order_id:
     *                 type: string
     *                 example: 660e8400-e29b-41d4-a716-446655440001
     *     responses:
     *       200:
     *         description: Drone assigned successfully
     *       400:
     *         description: Bad request (drone not available or battery too low)
     *       401:
     *         description: Unauthorized
     */
    router.post('/assignDrone', [
        requireUser,
        requireAdmin,
        validateResource(AssignDroneSchema),
        handleAssignDroneRequest,
    ])

    /**
     * @openapi
     * /drones/getDrone/{id}:
     *   get:
     *     tags:
     *       - Drones
     *     summary: Get single drone
     *     description: Retrieve details of a specific drone by ID
     *     operationId: handleGetDroneRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Drone ID
     *     responses:
     *       200:
     *         description: Drone details retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 serial_number:
     *                   type: string
     *                 battery_level:
     *                   type: number
     *                 status:
     *                   type: string
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getDrone/:id', [
        requireUser,
        validateResource(GetDroneSchema),
        handleGetDroneRequest,
    ])

    /**
     * @openapi
     * /drones/getDrones:
     *   get:
     *     tags:
     *       - Drones
     *     summary: Get paginated list of drones
     *     description: Retrieve a paginated list of all drones in the system
     *     operationId: handleGetDronesRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         required: true
     *         schema:
     *           type: string
     *         description: Page number
     *         example: "1"
     *       - in: query
     *         name: limit
     *         required: true
     *         schema:
     *           type: string
     *         description: Number of items per page
     *         example: "10"
     *     responses:
     *       200:
     *         description: List of drones retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   serial_number:
     *                     type: string
     *                   battery_level:
     *                     type: number
     *                   status:
     *                     type: string
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get(
        '/getDrones',
        requireUser,
        validateResource(GetDronesSchema),
        handleGetDronesRequest
    )

    return router
}
