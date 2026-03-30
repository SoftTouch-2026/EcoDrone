import { Router } from 'express'
import {
    handleSignUpRequest,
    handleSignInRequest,
    handleEditUserRequest,
    handleDeleteUserRequest,
    handleResetPasswordRequest,
    handleRefreshRequest,
} from '../controllers/auth.controllers'
import { validateResource } from '../middlewares/validateResource'
import {
    SignUpSchema,
    SignInSchema,
    EditUserSchema,
    DeleteUserSchema,
    ResetPasswordSchema,
    RefreshSchema,
} from '../schemas/auth.schemas'
import { requireUser } from '../middlewares/requireUser'

export const authRoutes = () => {
    const router = Router()

    /**
     * @openapi
     * /auth/signUp:
     *   post:
     *     tags:
     *       - Authentication
     *     summary: Register a new user
     *     description: Create a new user account with email and password
     *     operationId: handleSignUpRequest
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *               - first_name
     *               - last_name
     *               - type
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: user@example.com
     *               password:
     *                 type: string
     *                 minLength: 6
     *                 example: password123
     *               first_name:
     *                 type: string
     *                 example: John
     *               last_name:
     *                 type: string
     *                 example: Doe
     *               type:
     *                 type: string
     *                 enum: [user, admin]
     *                 example: user
     *               vendor_id:
     *                 type: string
     *                 format: uuid
     *                 nullable: true
     *                 example: 550e8400-e29b-41d4-a716-446655440000
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
     *                     user:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                         email:
     *                           type: string
     *                         first_name:
     *                           type: string
     *                         last_name:
     *                           type: string
     *                         type:
     *                           type: string
     *                           enum: [user, admin]
     *                         should_reset_password:
     *                           type: boolean
     *                         vendor_id:
     *                           type: string
     *                           format: uuid
     *                           nullable: true
     *                     accessToken:
     *                       type: string
     *                     refreshToken:
     *                       type: string
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/signUp', [
        validateResource(SignUpSchema),
        handleSignUpRequest,
    ])

    /**
     * @openapi
     * /auth/signIn:
     *   post:
     *     tags:
     *       - Authentication
     *     summary: Sign in to user account
     *     description: Authenticate user and receive JWT access and refresh tokens
     *     operationId: handleSignInRequest
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: user@example.com
     *               password:
     *                 type: string
     *                 minLength: 6
     *                 example: password123
     *     responses:
     *       200:
     *         description: Sign in successful
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
     *                   example: User signed in successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                         email:
     *                           type: string
     *                         first_name:
     *                           type: string
     *                         last_name:
     *                           type: string
     *                         type:
     *                           type: string
     *                           enum: [user, admin]
     *                         should_reset_password:
     *                           type: boolean
     *                     accessToken:
     *                       type: string
     *                     refreshToken:
     *                       type: string
     *       400:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/signIn', [
        validateResource(SignInSchema),
        handleSignInRequest,
    ])

    /**
     * @openapi
     * /auth/refresh:
     *   post:
     *     tags:
     *       - Authentication
     *     summary: Refresh access token
     *     description: Exchange a valid refresh token for new access and refresh tokens
     *     operationId: handleRefreshRequest
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - refreshToken
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 description: Valid refresh token from sign-in
     *     responses:
     *       200:
     *         description: Tokens refreshed successfully
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
     *                   example: Token refreshed successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     accessToken:
     *                       type: string
     *                     refreshToken:
     *                       type: string
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Forbidden
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/refresh', [
        validateResource(RefreshSchema),
        handleRefreshRequest,
    ])

    /**
     * @openapi
     * /auth/resetPassword:
     *   post:
     *     tags:
     *       - Authentication
     *     summary: Reset password
     *     description: Set new password and clear should_reset_password (requires authentication)
     *     operationId: handleResetPasswordRequest
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - newPassword
     *             properties:
     *               newPassword:
     *                 type: string
     *                 minLength: 6
     *     responses:
     *       200:
     *         description: Password reset successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    router.post('/resetPassword', [
        requireUser,
        validateResource(ResetPasswordSchema),
        handleResetPasswordRequest,
    ])

    /**
     * @openapi
     * /auth/editUser:
     *   post:
     *     tags:
     *       - Authentication
     *     summary: Update user profile
     *     description: Update user account information (requires authentication)
     *     operationId: handleEditUserRequest
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
     *               - email
     *               - password
     *               - first_name
     *               - last_name
     *             properties:
     *               id:
     *                 type: string
     *                 format: uuid
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 minLength: 6
     *               first_name:
     *                 type: string
     *               last_name:
     *                 type: string
     *     responses:
     *       200:
     *         description: User updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized
     */
    router.post('/editUser', [
        requireUser,
        validateResource(EditUserSchema),
        handleEditUserRequest,
    ])

    /**
     * @openapi
     * /auth/deleteUser:
     *   delete:
     *     tags:
     *       - Authentication
     *     summary: Delete user account
     *     description: Permanently delete a user account (requires authentication)
     *     operationId: handleDeleteUserRequest
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: User ID to delete
     *     responses:
     *       200:
     *         description: User deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized
     */
    router.delete('/deleteUser', [
        requireUser,
        validateResource(DeleteUserSchema),
        handleDeleteUserRequest,
    ])

    return router
}
