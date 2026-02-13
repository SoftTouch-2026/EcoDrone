import { NextFunction,Request,Response } from "express";
import { ZodTypeAny } from "zod";

export const validateResource = (schema:ZodTypeAny) => (req:Request,res:Response,next:NextFunction)=>{
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        })
        next()
    } catch (error:any) {
        return res.status(400).json({
            status: 'error',
            message: error.errors,
        })
    }
}