import { Router } from 'express'
import { validateResource } from '../middlewares/validateResource'
import {
    DashboardSummarySchema,
    ActivitySchema,
    DateRangeSchema,
    UserActivitySchema,
    HourlyOrdersSchema,
} from '../schemas/reports.schemas'
import {
    handleDashboardSummary,
    handleActivity,
    handleVendorPerformance,
    handleDronePerformance,
    handleDeliveryLocations,
    handleUserActivity,
    handleHourlyOrders,
} from '../controllers/reports.controllers'

export const adminReportsRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /admin/reports/dashboard-summary:
     *   get:
     *     tags:
     *       - Admin Reports
     *     summary: Dashboard summary
     *     description: High-level metrics for dashboard cards and today's chart
     *     operationId: handleDashboardSummary
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Dashboard summary retrieved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *                   properties:
     *                     active_deliveries_count:
     *                       type: integer
     *                     drones_operational_count:
     *                       type: integer
     *                     drones_total_count:
     *                       type: integer
     *                     orders_today_count:
     *                       type: integer
     *                     avg_delivery_time_minutes:
     *                       type: number
     *                     hourly_orders_today:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           hour:
     *                             type: string
     *                           orders:
     *                             type: integer
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/dashboard-summary',
        validateResource(DashboardSummarySchema),
        handleDashboardSummary
    )

    /**
     * @openapi
     * /admin/reports/activity:
     *   get:
     *     tags:
     *       - Admin Reports
     *     summary: Recent activity
     *     description: Chronological list of recent activity for the activity panel
     *     operationId: handleActivity
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: limit
     *         schema:
     *           type: string
     *         description: Max number of items (default 20)
     *     responses:
     *       200:
     *         description: Activity retrieved
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
     *                           time:
     *                             type: string
     *                           type:
     *                             type: string
     *                           message:
     *                             type: string
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/activity',
        validateResource(ActivitySchema),
        handleActivity
    )

    /**
     * @openapi
     * /admin/reports/vendor-performance:
     *   get:
     *     tags:
     *       - Admin Reports
     *     summary: Vendor performance
     *     description: Aggregated vendor metrics over a date range
     *     operationId: handleVendorPerformance
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: date_from
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: date_to
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: period
     *         schema:
     *           type: string
     *           enum: [this_week, this_month]
     *     responses:
     *       200:
     *         description: Vendor performance retrieved
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
     *                       vendor_id:
     *                         type: string
     *                       vendor_name:
     *                         type: string
     *                       orders_count:
     *                         type: integer
     *                       items_delivered_count:
     *                         type: integer
     *                       revenue:
     *                         type: number
     *                       avg_delivery_time_minutes:
     *                         type: number
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/vendor-performance',
        validateResource(DateRangeSchema),
        handleVendorPerformance
    )

    /**
     * @openapi
     * /admin/reports/drone-performance:
     *   get:
     *     tags:
     *       - Admin Reports
     *     summary: Drone performance
     *     description: Aggregated drone/flight metrics over a date range
     *     operationId: handleDronePerformance
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: date_from
     *         schema:
     *           type: string
     *       - in: query
     *         name: date_to
     *         schema:
     *           type: string
     *       - in: query
     *         name: period
     *         schema:
     *           type: string
     *           enum: [this_week, this_month]
     *     responses:
     *       200:
     *         description: Drone performance retrieved
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
     *                       drone_id:
     *                         type: string
     *                       drone_name:
     *                         type: string
     *                       flights_count:
     *                         type: integer
     *                       flight_time_hours:
     *                         type: number
     *                       avg_battery_at_landing_percent:
     *                         type: number
     *                       groundings_count:
     *                         type: integer
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/drone-performance',
        validateResource(DateRangeSchema),
        handleDronePerformance
    )

    /**
     * @openapi
     * /admin/reports/delivery-locations:
     *   get:
     *     tags:
     *       - Admin Reports
     *     summary: Delivery locations report
     *     description: Orders count and percentage per dropoff location
     *     operationId: handleDeliveryLocations
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: date_from
     *         schema:
     *           type: string
     *       - in: query
     *         name: date_to
     *         schema:
     *           type: string
     *       - in: query
     *         name: period
     *         schema:
     *           type: string
     *           enum: [this_week, this_month]
     *     responses:
     *       200:
     *         description: Delivery locations retrieved
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
     *                       location_id:
     *                         type: string
     *                       location_name:
     *                         type: string
     *                       orders_count:
     *                         type: integer
     *                       percentage:
     *                         type: number
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/delivery-locations',
        validateResource(DateRangeSchema),
        handleDeliveryLocations
    )

    /**
     * @openapi
     * /admin/reports/user-activity:
     *   get:
     *     tags:
     *       - Admin Reports
     *     summary: User activity
     *     description: List of user events (e.g. orders placed) for Reports tab
     *     operationId: handleUserActivity
     *     security:
     *       - bearerAuth: []
     *     parameters:
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
     *         description: User activity retrieved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: object
     *                   properties:
     *                     items:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           time:
     *                             type: string
     *                           type:
     *                             type: string
     *                           user_id:
     *                             type: string
     *                           user_email:
     *                             type: string
     *                           message:
     *                             type: string
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/user-activity',
        validateResource(UserActivitySchema),
        handleUserActivity
    )

    /**
     * @openapi
     * /admin/reports/hourly-orders:
     *   get:
     *     tags:
     *       - Admin Reports
     *     summary: Hourly orders
     *     description: Orders count per hour for chart (optional; dashboard-summary includes today)
     *     operationId: handleHourlyOrders
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: date
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
     *     responses:
     *       200:
     *         description: Hourly orders retrieved
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
     *                       hour:
     *                         type: string
     *                       orders:
     *                         type: integer
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/hourly-orders',
        validateResource(HourlyOrdersSchema),
        handleHourlyOrders
    )

    return router
}
