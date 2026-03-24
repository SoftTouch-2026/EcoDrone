import { Router } from 'express'
import {
    handleCreateTripRequest,
    handleUpdateTripRequest,
    handleDeleteTripRequest,
    handleGetTripRequest,
    handleGetTripsRequest,
    handleStartTripRequest,
    handleEndTripRequest,
} from '../controllers/trips.controllers'
import { requireUser } from '../middlewares/requireUser'
import { validateResource } from '../middlewares/validateResource'
import {
    CreateTripSchema,
    UpdateTripSchema,
    DeleteTripSchema,
    GetTripSchema,
    GetTripsSchema,
    StartTripSchema,
    EndTripSchema,
} from '../schemas/trips.schemas'

export const tripRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /trips/createTrip:
     *   post:
     *     tags:
     *       - Trips
     *     summary: Create a new trip
     *     description: Create a delivery trip for an order
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
     *               - status
     *             properties:
     *               order_id:
     *                 type: string
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               status:
     *                 type: string
     *                 enum: [ongoing, completed, created, cancelled]
     *                 example: created
     *     responses:
     *       201:
     *         description: Trip created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/createTrip', [
        requireUser,
        validateResource(CreateTripSchema),
        handleCreateTripRequest,
    ])

    /**
     * @openapi
     * /trips/updateTrip:
     *   post:
     *     tags:
     *       - Trips
     *     summary: Update trip status
     *     description: Update the status of an existing trip
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - trip_id
     *               - status
     *             properties:
     *               trip_id:
     *                 type: string
     *               status:
     *                 type: string
     *                 enum: [ongoing, completed, created, cancelled]
     *     responses:
     *       200:
     *         description: Trip updated successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/updateTrip', [
        requireUser,
        validateResource(UpdateTripSchema),
        handleUpdateTripRequest,
    ])

    /**
     * @openapi
     * /trips/deleteTrip:
     *   delete:
     *     tags:
     *       - Trips
     *     summary: Delete a trip
     *     description: Remove a trip from the system
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Trip ID
     *     responses:
     *       200:
     *         description: Trip deleted successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.delete('/deleteTrip', [
        requireUser,
        validateResource(DeleteTripSchema),
        handleDeleteTripRequest,
    ])

    /**
     * @openapi
     * /trips/getTrip:
     *   get:
     *     tags:
     *       - Trips
     *     summary: Get single trip
     *     description: Retrieve details of a specific trip by ID
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Trip ID
     *     responses:
     *       200:
     *         description: Trip details retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 order_id:
     *                   type: string
     *                 status:
     *                   type: string
     *                 start_time:
     *                   type: string
     *                   format: date-time
     *                 end_time:
     *                   type: string
     *                   format: date-time
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getTrip', [
        requireUser,
        validateResource(GetTripSchema),
        handleGetTripRequest,
    ])

    /**
     * @openapi
     * /trips/getTrips:
     *   get:
     *     tags:
     *       - Trips
     *     summary: Get paginated list of trips
     *     description: Retrieve a paginated list of all trips
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
     *         description: List of trips retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   order_id:
     *                     type: string
     *                   status:
     *                     type: string
     *                   start_time:
     *                     type: string
     *                     format: date-time
     *                   end_time:
     *                     type: string
     *                     format: date-time
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/getTrips', [
        requireUser,
        validateResource(GetTripsSchema),
        handleGetTripsRequest,
    ])

    /**
     * @openapi
     * /trips/startTrip:
     *   post:
     *     tags:
     *       - Trips
     *     summary: Start a trip
     *     description: Mark a trip as ongoing and record the start time
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - trip_id
     *             properties:
     *               trip_id:
     *                 type: string
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *     responses:
     *       200:
     *         description: Trip started successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 status:
     *                   type: string
     *                   example: ongoing
     *                 start_time:
     *                   type: string
     *                   format: date-time
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/startTrip', [
        requireUser,
        validateResource(StartTripSchema),
        handleStartTripRequest,
    ])

    /**
     * @openapi
     * /trips/endTrip:
     *   post:
     *     tags:
     *       - Trips
     *     summary: End a trip
     *     description: Mark a trip as completed and record the end time
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - trip_id
     *             properties:
     *               trip_id:
     *                 type: string
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *     responses:
     *       200:
     *         description: Trip ended successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 status:
     *                   type: string
     *                   example: completed
     *                 end_time:
     *                   type: string
     *                   format: date-time
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/endTrip', [
        requireUser,
        validateResource(EndTripSchema),
        handleEndTripRequest,
    ])

    return router
}
