import { Router } from 'express'
import { validateResource } from '../middlewares/validateResource'
import {
    CurrentReadingsSchema,
    FlightLogsSchema,
    TimeSeriesSchema,
} from '../schemas/environmental.schemas'
import {
    handleCurrentReadings,
    handleFlightLogs,
    handleTimeSeries,
} from '../controllers/environmental.controllers'

export const adminEnvironmentalRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /admin/environmental/current-readings:
     *   get:
     *     tags:
     *       - Admin Environmental
     *     summary: Current environmental readings
     *     description: Latest sensor readings by drone (stubbed until sensors integrated)
     *     operationId: handleCurrentReadings
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: drone_id
     *         schema:
     *           type: string
     *         description: Optional drone ID to filter
     *     responses:
     *       200:
     *         description: Current readings retrieved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: object
     *                   properties:
     *                     readings_by_drone:
     *                       type: object
     *                       additionalProperties:
     *                         type: object
     *                         properties:
     *                           drone_id:
     *                             type: string
     *                           timestamp:
     *                             type: string
     *                           temperature_c:
     *                             type: number
     *                           humidity_percent:
     *                             type: number
     *                           pm25_ug_m3:
     *                             type: number
     *                           co2_ppm:
     *                             type: number
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/current-readings',
        validateResource(CurrentReadingsSchema),
        handleCurrentReadings
    )

    /**
     * @openapi
     * /admin/environmental/flight-logs:
     *   get:
     *     tags:
     *       - Admin Environmental
     *     summary: Flight logs
     *     description: Environmental data per flight (stubbed; derived from trips where available)
     *     operationId: handleFlightLogs
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: drone_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: date_from
     *         schema:
     *           type: string
     *       - in: query
     *         name: date_to
     *         schema:
     *           type: string
     *       - in: query
     *         name: limit
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Flight logs retrieved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: object
     *                   properties:
     *                     items:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           flight_id:
     *                             type: string
     *                           drone_id:
     *                             type: string
     *                           started_at:
     *                             type: string
     *                           ended_at:
     *                             type: string
     *                           avg_temperature_c:
     *                             type: number
     *                           avg_humidity_percent:
     *                             type: number
     *                           avg_pm25_ug_m3:
     *                             type: number
     *                           avg_co2_ppm:
     *                             type: number
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/flight-logs',
        validateResource(FlightLogsSchema),
        handleFlightLogs
    )

    /**
     * @openapi
     * /admin/environmental/time-series:
     *   get:
     *     tags:
     *       - Admin Environmental
     *     summary: Environmental time-series
     *     description: Aggregated sensor data over time (stubbed until sensors integrated)
     *     operationId: handleTimeSeries
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: metric
     *         schema:
     *           type: string
     *           enum: [temperature_c, humidity_percent, pm25_ug_m3, co2_ppm]
     *       - in: query
     *         name: drone_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: date_from
     *         schema:
     *           type: string
     *       - in: query
     *         name: date_to
     *         schema:
     *           type: string
     *       - in: query
     *         name: interval
     *         schema:
     *           type: string
     *           enum: [hour, day]
     *     responses:
     *       200:
     *         description: Time-series data retrieved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: object
     *                   properties:
     *                     metric:
     *                       type: string
     *                     interval:
     *                       type: string
     *                     points:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           timestamp:
     *                             type: string
     *                           value:
     *                             type: number
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/time-series',
        validateResource(TimeSeriesSchema),
        handleTimeSeries
    )

    return router
}
