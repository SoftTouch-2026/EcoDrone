import { Response, Request } from 'express'
import {
    CreateFlightCommandInput,
    GetPendingCommandsInput,
    AcknowledgeCommandInput,
    ReportTelemetryInput,
    GetLatestTelemetryInput,
} from '../utils/types'
import {
    createFlightCommandService,
    getPendingCommandsService,
    acknowledgeCommandService,
    reportTelemetryService,
    getLatestTelemetryService,
} from '../services/groundStation.service'

export const handleCreateFlightCommandRequest = async (
    req: Request<{}, {}, CreateFlightCommandInput['body']>,
    res: Response
) => {
    try {
        const command = await createFlightCommandService(req.body)
        res.status(201).json(command)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleGetPendingCommandsRequest = async (
    req: Request<GetPendingCommandsInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const commands = await getPendingCommandsService(req.params)
        res.status(200).json(commands)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleAcknowledgeCommandRequest = async (
    req: Request<{}, {}, AcknowledgeCommandInput['body']>,
    res: Response
) => {
    try {
        const command = await acknowledgeCommandService(req.body)
        res.status(200).json(command)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleReportTelemetryRequest = async (
    req: Request<{}, {}, ReportTelemetryInput['body']>,
    res: Response
) => {
    try {
        const telemetry = await reportTelemetryService(req.body)
        res.status(201).json(telemetry)
    } catch (e) {
        res.status(400).send(e)
    }
}

export const handleGetLatestTelemetryRequest = async (
    req: Request<GetLatestTelemetryInput['params'], {}, {}>,
    res: Response
) => {
    try {
        const telemetry = await getLatestTelemetryService(req.params)
        res.status(200).json(telemetry)
    } catch (e) {
        res.status(400).send(e)
    }
}
