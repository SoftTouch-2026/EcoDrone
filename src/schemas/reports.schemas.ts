import * as z from 'zod'

export const DashboardSummaryQuery = {
    query: z.object({
        // no required params
    }),
}

export const ActivityQuery = {
    query: z.object({
        limit: z.string().optional(),
    }),
}

export const DateRangeQuery = {
    query: z.object({
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        period: z.enum(['this_week', 'this_month']).optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
}

export const UserActivityQuery = {
    query: z.object({
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        limit: z.string().optional(),
    }),
}

export const HourlyOrdersQuery = {
    query: z.object({
        date: z.string().optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
    }),
}

export const DashboardSummarySchema = z.object({ ...DashboardSummaryQuery })
export const ActivitySchema = z.object({ ...ActivityQuery })
export const DateRangeSchema = z.object({ ...DateRangeQuery })
export const UserActivitySchema = z.object({ ...UserActivityQuery })
export const HourlyOrdersSchema = z.object({ ...HourlyOrdersQuery })
