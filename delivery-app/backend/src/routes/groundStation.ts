import { Router } from 'express'
import { validateResource } from '../middlewares/validateResource'
import {
    handleCreateFlightCommandRequest,
    handleGetPendingCommandsRequest,
    handleAcknowledgeCommandRequest,
    handleReportTelemetryRequest,
    handleGetLatestTelemetryRequest,
} from '../controllers/groundStation.controllers'
import {
    CreateFlightCommandSchema,
    GetPendingCommandsSchema,
    AcknowledgeCommandSchema,
    ReportTelemetrySchema,
    GetLatestTelemetrySchema,
} from '../schemas/groundStation.schemas'
import { requireUser } from '../middlewares/requireUser'

export const groundStationRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /ground-station/commands:
     *   post:
     *     tags:
     *       - Ground Station
     *     summary: Create a flight command
     *     description: |
     *       Issue a command for a drone to fly from origin to destination.
     *       Coordinates are decimal-degree GPS (latitude, longitude) as
     *       expected by the Parrot Olympe SDK moveTo() function.
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
     *               - origin_latitude
     *               - origin_longitude
     *               - dest_latitude
     *               - dest_longitude
     *               - altitude
     *               - scheduled_time
     *             properties:
     *               drone_id:
     *                 type: string
     *                 format: uuid
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               origin_latitude:
     *                 type: number
     *                 format: double
     *                 example: 5.7597
     *               origin_longitude:
     *                 type: number
     *                 format: double
     *                 example: -0.2199
     *               dest_latitude:
     *                 type: number
     *                 format: double
     *                 example: 5.7610
     *               dest_longitude:
     *                 type: number
     *                 format: double
     *                 example: -0.2250
     *               altitude:
     *                 type: number
     *                 format: double
     *                 example: 10
     *               scheduled_time:
     *                 type: string
     *                 format: date-time
     *                 example: "2026-03-12T19:00:00Z"
     *     responses:
     *       201:
     *         description: Flight command created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/commands', [
        requireUser,
        validateResource(CreateFlightCommandSchema),
        handleCreateFlightCommandRequest,
    ])

    /**
     * @openapi
     * /ground-station/commands/pending/{drone_id}:
     *   get:
     *     tags:
     *       - Ground Station
     *     summary: Get pending flight commands for a drone
     *     description: |
     *       Ground station polls this endpoint to discover new flight
     *       commands assigned to a specific drone. Returns commands
     *       with status "pending" or "acknowledged", ordered by
     *       scheduled_time ascending.
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: drone_id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Drone UUID
     *     responses:
     *       200:
     *         description: List of pending commands
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/commands/pending/:drone_id', [
        requireUser,
        validateResource(GetPendingCommandsSchema),
        handleGetPendingCommandsRequest,
    ])

    /**
     * @openapi
     * /ground-station/commands/acknowledge:
     *   post:
     *     tags:
     *       - Ground Station
     *     summary: Update flight command status
     *     description: |
     *       Ground station calls this to report progress on a flight
     *       command (acknowledged, in_progress, completed, failed, cancelled).
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - command_id
     *               - status
     *             properties:
     *               command_id:
     *                 type: string
     *                 format: uuid
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               status:
     *                 type: string
     *                 enum: [acknowledged, in_progress, completed, failed, cancelled]
     *                 example: acknowledged
     *     responses:
     *       200:
     *         description: Command status updated
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/commands/acknowledge', [
        requireUser,
        validateResource(AcknowledgeCommandSchema),
        handleAcknowledgeCommandRequest,
    ])

    /**
     * @openapi
     * /ground-station/telemetry:
     *   post:
     *     tags:
     *       - Ground Station
     *     summary: Report drone telemetry
     *     description: |
     *       Ground station reports real-time drone status including
     *       GPS position, battery, flight state, speed, and ETA.
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
     *               - latitude
     *               - longitude
     *               - altitude
     *               - battery_level
     *               - drone_state
     *             properties:
     *               drone_id:
     *                 type: string
     *                 format: uuid
     *               latitude:
     *                 type: number
     *                 format: double
     *                 example: 5.7597
     *               longitude:
     *                 type: number
     *                 format: double
     *                 example: -0.2199
     *               altitude:
     *                 type: number
     *                 format: double
     *                 example: 10.5
     *               battery_level:
     *                 type: number
     *                 example: 85.5
     *               drone_state:
     *                 type: string
     *                 example: hovering
     *               speed:
     *                 type: number
     *                 format: double
     *                 example: 2.5
     *               heading:
     *                 type: number
     *                 format: double
     *                 example: 180.0
     *               eta_seconds:
     *                 type: integer
     *                 example: 120
     *     responses:
     *       201:
     *         description: Telemetry recorded
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/telemetry', [
        requireUser,
        validateResource(ReportTelemetrySchema),
        handleReportTelemetryRequest,
    ])

    /**
     * @openapi
     * /ground-station/telemetry/latest/{drone_id}:
     *   get:
     *     tags:
     *       - Ground Station
     *     summary: Get latest drone telemetry
     *     description: |
     *       Retrieve the most recent telemetry report for a specific drone.
     *       Returns null if no telemetry has been reported yet.
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: drone_id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Drone UUID
     *     responses:
     *       200:
     *         description: Latest telemetry data
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.get('/telemetry/latest/:drone_id', [
        requireUser,
        validateResource(GetLatestTelemetrySchema),
        handleGetLatestTelemetryRequest,
    ])

    return router
}
