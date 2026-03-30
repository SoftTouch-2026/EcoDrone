import { NextFunction, Request, Response } from 'express'

export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = res.locals.user
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            })
        }
        if (user.type !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Forbidden: admin access required',
            })
        }
        return next()
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unauthorized'
        return res.status(401).json({
            status: 'error',
            message,
        })
    }
}
