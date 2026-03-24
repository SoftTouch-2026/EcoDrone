import { NextFunction,Request,Response } from "express";
import { verifyJWT,verifyRefreshJWT } from "../utils/jwtUtils";


export const deserializer = (req:Request,res:Response,next:NextFunction) => {
    try {
        const accessToken = req?.headers?.['authorization']?.replace(/^Bearer\s/, '')
        const refreshToken = req?.headers?.['x-refresh']

        if(!accessToken && !refreshToken){
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            })
        }

        if(accessToken){
            const decoded = verifyJWT(accessToken)
            if(!decoded){
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized',
                })
            }
            res.locals.user = decoded
        }

        if(refreshToken){
            const decoded = verifyRefreshJWT(refreshToken as string)
            if(!decoded){
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized',
                })
            }
            res.locals.user = decoded
        }

        next()
    } catch(e) {
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized',
        })
    }
}