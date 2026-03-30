import { Response } from 'express'

export function sendError(
    res: Response,
    statusCode: number,
    error: unknown
): Response {
    const message =
        error instanceof Error ? error.message : 'An error occurred'
    return res.status(statusCode).json({
        status: 'error',
        message,
    })
}
