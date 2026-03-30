import { Router } from 'express'
import {
    handleCreateAdminUserRequest,
    handleListAdminUsersRequest,
    handleGetAdminUserRequest,
    handleUpdateAdminUserRequest,
    handleDeleteAdminUserRequest,
} from '../controllers/admin.controllers'
import { handleListAuditLogsRequest } from '../controllers/audit.controllers'
import { validateResource } from '../middlewares/validateResource'
import {
    CreateAdminUserSchema,
    UpdateAdminUserSchema,
    GetAdminUserSchema,
    ListAdminUsersSchema,
    DeleteAdminUserSchema,
} from '../schemas/admin.schemas'
import { ListAuditLogsSchema } from '../schemas/audit.schemas'
import { requireUser } from '../middlewares/requireUser'
import { requireAdmin } from '../middlewares/requireAdmin'
import { adminReportsRoutes } from './admin.reports'
import { adminEnvironmentalRoutes } from './admin.environmental'

export const adminRoutes = () => {
    const router = Router()

    router.use(requireUser)
    router.use(requireAdmin)

    router.use('/reports', adminReportsRoutes())
    router.use('/environmental', adminEnvironmentalRoutes())

    /**
     * @openapi
     * /admin/users:
     *   post:
     *     tags:
     *       - Admin
     *     summary: Create user (admin only)
     *     description: Create a new user. Admin-created accounts have should_reset_password set to true.
     *     operationId: handleCreateAdminUserRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - first_name
     *               - last_name
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               first_name:
     *                 type: string
     *               last_name:
     *                 type: string
     *               password:
     *                 type: string
     *                 minLength: 6
     *               type:
     *                 type: string
     *                 enum: [user, admin]
     *                 default: user
     *     responses:
     *       201:
     *         description: User created successfully
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
     *                   example: User created successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     email:
     *                       type: string
     *                     first_name:
     *                       type: string
     *                     last_name:
     *                       type: string
     *                     type:
     *                       type: string
     *                     should_reset_password:
     *                       type: boolean
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden (admin required)
     */
    router.post(
        '/users',
        validateResource(CreateAdminUserSchema),
        handleCreateAdminUserRequest
    )

    /**
     * @openapi
     * /admin/users:
     *   get:
     *     tags:
     *       - Admin
     *     summary: List users (admin only)
     *     description: Get paginated list of users with optional type filter
     *     operationId: handleListAdminUsersRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: string
     *           default: "1"
     *       - in: query
     *         name: limit
     *         schema:
     *           type: string
     *           default: "10"
     *       - in: query
     *         name: type
     *         schema:
     *           type: string
     *           enum: [user, admin]
     *     responses:
     *       200:
     *         description: Users retrieved successfully
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
     *                   example: Users retrieved successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     users:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             format: uuid
     *                           email:
     *                             type: string
     *                           first_name:
     *                             type: string
     *                           last_name:
     *                             type: string
     *                           type:
     *                             type: string
     *                           should_reset_password:
     *                             type: boolean
     *                     total:
     *                       type: integer
     *                     page:
     *                       type: integer
     *                     limit:
     *                       type: integer
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden (admin required)
     */
    router.get(
        '/users',
        validateResource(ListAdminUsersSchema),
        handleListAdminUsersRequest
    )

    /**
     * @openapi
     * /admin/users/{id}:
     *   get:
     *     tags:
     *       - Admin
     *     summary: Get user by ID (admin only)
     *     description: Retrieve a single user by ID
     *     operationId: handleGetAdminUserRequest
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
     *         description: User retrieved successfully
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
     *                   example: User retrieved successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     email:
     *                       type: string
     *                     first_name:
     *                       type: string
     *                     last_name:
     *                       type: string
     *                     type:
     *                       type: string
     *                     should_reset_password:
     *                       type: boolean
     *                     created_at:
     *                       type: string
     *                       format: date-time
     *                     updated_at:
     *                       type: string
     *                       format: date-time
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden (admin required)
     *       404:
     *         description: User not found
     */
    router.get(
        '/users/:id',
        validateResource(GetAdminUserSchema),
        handleGetAdminUserRequest
    )

    /**
     * @openapi
     * /admin/users/{id}:
     *   patch:
     *     tags:
     *       - Admin
     *     summary: Update user (admin only)
     *     description: Update a user by ID. All body fields are optional.
     *     operationId: handleUpdateAdminUserRequest
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
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               first_name:
     *                 type: string
     *               last_name:
     *                 type: string
     *               password:
     *                 type: string
     *                 minLength: 6
     *               type:
     *                 type: string
     *                 enum: [user, admin]
     *               should_reset_password:
     *                 type: boolean
     *     responses:
     *       200:
     *         description: User updated successfully
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
     *                   example: User updated successfully
     *                 data:
     *                   type: object
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden (admin required)
     *       404:
     *         description: User not found
     */
    router.patch(
        '/users/:id',
        validateResource(UpdateAdminUserSchema),
        handleUpdateAdminUserRequest
    )

    /**
     * @openapi
     * /admin/users/{id}:
     *   delete:
     *     tags:
     *       - Admin
     *     summary: Delete user (admin only)
     *     description: Delete a user by ID. Admins cannot delete their own account.
     *     operationId: handleDeleteAdminUserRequest
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
     *         description: User deleted successfully
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
     *                   example: User deleted successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     email:
     *                       type: string
     *                     first_name:
     *                       type: string
     *                     last_name:
     *                       type: string
     *                     type:
     *                       type: string
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden (admin required or cannot delete self)
     */
    router.delete(
        '/users/:id',
        validateResource(DeleteAdminUserSchema),
        handleDeleteAdminUserRequest
    )

    /**
     * @openapi
     * /admin/audit-logs:
     *   get:
     *     tags:
     *       - Admin
     *     summary: List audit logs
     *     description: Paginated list of audit log entries with optional filters (admin only)
     *     operationId: handleListAuditLogsRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: string
     *           default: "1"
     *       - in: query
     *         name: limit
     *         schema:
     *           type: string
     *           default: "20"
     *       - in: query
     *         name: action
     *         schema:
     *           type: string
     *         description: Filter by action (e.g. auth.sign_in, drone.create)
     *       - in: query
     *         name: resource_type
     *         schema:
     *           type: string
     *         description: Filter by resource type (user, order, drone, vendor, trip)
     *       - in: query
     *         name: actor_id
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Filter by actor user ID
     *       - in: query
     *         name: date_from
     *         schema:
     *           type: string
     *         description: ISO date filter from
     *       - in: query
     *         name: date_to
     *         schema:
     *           type: string
     *         description: ISO date filter to
     *     responses:
     *       200:
     *         description: Audit logs retrieved
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
     *                       created_at:
     *                         type: string
     *                         format: date-time
     *                       action:
     *                         type: string
     *                       actor_id:
     *                         type: string
     *                         nullable: true
     *                       resource_type:
     *                         type: string
     *                       resource_id:
     *                         type: string
     *                         nullable: true
     *                       message:
     *                         type: string
     *                         nullable: true
     *                       metadata:
     *                         type: object
     *                         nullable: true
     *                       success:
     *                         type: boolean
     *                       ip:
     *                         type: string
     *                         nullable: true
     *                       user_agent:
     *                         type: string
     *                         nullable: true
     *                 total:
     *                   type: integer
     *                 page:
     *                   type: integer
     *                 limit:
     *                   type: integer
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     */
    router.get(
        '/audit-logs',
        validateResource(ListAuditLogsSchema),
        handleListAuditLogsRequest
    )

    return router
}
