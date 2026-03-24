import { prisma } from '../utils/connect'
import {
    CreateFlightCommandInput,
    GetPendingCommandsInput,
    AcknowledgeCommandInput,
    ReportTelemetryInput,
    GetLatestTelemetryInput,
} from '../utils/types'

// ─── Flight Commands ────────────────────────────────────────

export const createFlightCommandService = async (
    data: CreateFlightCommandInput['body']
) => {
    try {
        const command = await prisma.flight_commands.create({
            data: {
                drone_id: data.drone_id,
                origin_latitude: data.origin_latitude,
                origin_longitude: data.origin_longitude,
                dest_latitude: data.dest_latitude,
                dest_longitude: data.dest_longitude,
                altitude: data.altitude,
                scheduled_time: new Date(data.scheduled_time),
            },
        })
        return command
    } catch (e) {
        throw e
    }
}

export const getPendingCommandsService = async (
    data: GetPendingCommandsInput['params']
) => {
    try {
        const { drone_id } = data
        const commands = await prisma.flight_commands.findMany({
            where: {
                drone_id,
                status: { in: ['pending', 'acknowledged'] },
            },
            orderBy: { scheduled_time: 'asc' },
        })
        return commands
    } catch (e) {
        throw e
    }
}

export const acknowledgeCommandService = async (
    data: AcknowledgeCommandInput['body']
) => {
    try {
        const { command_id, status } = data
        const command = await prisma.flight_commands.update({
            where: { id: command_id },
            data: { status },
        })
        return command
    } catch (e) {
        throw e
    }
}

// ─── Drone Telemetry ────────────────────────────────────────

export const reportTelemetryService = async (
    data: ReportTelemetryInput['body']
) => {
    try {
        const telemetry = await prisma.drone_telemetry.create({
            data: {
                drone_id: data.drone_id,
                latitude: data.latitude,
                longitude: data.longitude,
                altitude: data.altitude,
                battery_level: data.battery_level,
                drone_state: data.drone_state,
                speed: data.speed ?? null,
                heading: data.heading ?? null,
                eta_seconds: data.eta_seconds ?? null,
            },
        })
        return telemetry
    } catch (e) {
        throw e
    }
}

export const getLatestTelemetryService = async (
    data: GetLatestTelemetryInput['params']
) => {
    try {
        const { drone_id } = data
        const telemetry = await prisma.drone_telemetry.findFirst({
            where: { drone_id },
            orderBy: { reported_at: 'desc' },
        })
        return telemetry
    } catch (e) {
        throw e
    }
}
