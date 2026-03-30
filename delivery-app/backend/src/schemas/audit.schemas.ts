import * as z from 'zod'

export const ListAuditLogsQuery = {
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        action: z.string().optional(),
        resource_type: z.string().optional(),
        actor_id: z.string().uuid().optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
    }),
}

export const ListAuditLogsSchema = z.object({ ...ListAuditLogsQuery })
