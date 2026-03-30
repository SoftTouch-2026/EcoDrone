import { NextFunction, Request, Response } from 'express'

export const requireUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = res.locals.user
        if (!user) {
            console.log('this happened, ', 123238888)
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            })
        }
        return next()
    } catch (error: any) {
        console.log('this happened, ', 123238888)
        return res.status(401).json({
            status: 'error',
            message: error.message,
        })
    }
}
