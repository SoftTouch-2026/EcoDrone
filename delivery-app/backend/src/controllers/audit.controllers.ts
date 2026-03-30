import { Request, Response } from 'express'
import { listAuditLogsService } from '../services/audit.service'
import { sendError } from '../utils/errorResponse'

export async function handleListAuditLogsRequest(
    req: Request<{}, {}, {}, { page?: string; limit?: string; action?: string; resource_type?: string; actor_id?: string; date_from?: string; date_to?: string }>,
    res: Response
) {
    try {
        const result = await listAuditLogsService(req.query)
        return res.status(200).json(result)
    } catch (e) {
        return sendError(res, 400, e)
    }
}
