
import { Request } from 'express'
import { prisma } from '../utils/connect'

export interface CreateAuditLogParams {
    action: string
    resourceType: string
    resourceId?: string
    actorId?: string
    message?: string
    metadata?: object
    success: boolean
    req?: Request
}

function getIp(req: Request | undefined): string | null {
    if (!req) return null
    const forwarded = req.headers?.['x-forwarded-for']
    if (typeof forwarded === 'string') return (forwarded.split(',')[0] ?? '').trim()
    return req.ip ?? null
}

function getUserAgent(req: Request | undefined): string | null {
    if (!req) return null
    const ua = req.get('user-agent')
    return ua ?? null
}

/**
 * Persist an audit log entry. Never throws; log failures are reported to console only.
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
    const {
        action,
        resourceType,
        resourceId,
        actorId,
        message,
        metadata,
        success,
        req: request,
    } = params
    try {
        const ip = request ? getIp(request) : null
        const user_agent = request ? getUserAgent(request) : null
        const data = {
            action,
            resource_type: resourceType,
            resource_id: resourceId ?? null,
            actor_id: actorId ?? null,
            message: message ?? null,
            success,
            ip,
            user_agent,
            ...(metadata != null && { metadata }),
        }
        await prisma.audit_log.create({
            data,
        })
        if (process.env.NODE_ENV !== 'production') {
            console.log(
                `[audit] ${action} ${resourceType}${resourceId ? ` ${resourceId}` : ''} success=${success}`
            )
        }
    } catch (e) {
        console.error('[audit] Failed to write audit log:', e)
    }
}

export interface ListAuditLogsQuery {
    page?: string
    limit?: string
    action?: string
    resource_type?: string
    actor_id?: string
    date_from?: string
    date_to?: string
}

export async function listAuditLogsService(query: ListAuditLogsQuery) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)))
    const skip = (page - 1) * limit

    const where: {
        action?: string
        resource_type?: string
        actor_id?: string
        created_at?: { gte?: Date; lte?: Date }
    } = {}
    if (query.action) where.action = query.action
    if (query.resource_type) where.resource_type = query.resource_type
    if (query.actor_id) where.actor_id = query.actor_id
    if (query.date_from || query.date_to) {
        where.created_at = {}
        if (query.date_from) where.created_at.gte = new Date(query.date_from)
        if (query.date_to) where.created_at.lte = new Date(query.date_to)
    }

    const [items, total] = await Promise.all([
        prisma.audit_log.findMany({
            where,
            orderBy: { created_at: 'desc' },
            skip,
            take: limit,
        }),
        prisma.audit_log.count({ where }),
    ])

    return {
        data: items,
        total,
        page,
        limit,
    }
}
