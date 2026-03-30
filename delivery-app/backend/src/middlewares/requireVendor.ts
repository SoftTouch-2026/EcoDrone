import { NextFunction, Request, Response } from 'express'

export const requireVendor = (
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
        if (!user.vendor_id) {
            return res.status(403).json({
                status: 'error',
                message: 'Vendor account required',
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
