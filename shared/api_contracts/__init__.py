"""EcoDrone Shared API Contracts - Public Interface"""

from .mission import (
    MissionState,
    GPSCoordinate,
    MissionIntent,
    MissionStatus,
    MissionAcknowledgment
)

from .telemetry import (
    DroneHealth,
    TelemetryUpdate,
    DroneRegistry
)

from .command import (
    CommandType,
    CommandPriority,
    MissionCommand,
    CommandResponse
)

from .responses import (
    APIResponse,
    ErrorResponse,
    PaginatedResponse
)

__all__ = [
    # Mission
    "MissionState",
    "GPSCoordinate",
    "MissionIntent",
    "MissionStatus",
    "MissionAcknowledgment",
    
    # Telemetry
    "DroneHealth",
    "TelemetryUpdate",
    "DroneRegistry",
    
    # Commands
    "CommandType",
    "CommandPriority",
    "MissionCommand",
    "CommandResponse",
    
    # Responses
    "APIResponse",
    "ErrorResponse",
    "PaginatedResponse",
]
