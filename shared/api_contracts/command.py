"""
EcoDrone Shared API Contracts - Command Data Structures

This module defines command messages sent from Cloud Backend → Ground Station.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class CommandType(str, Enum):
    """Types of commands that can be sent to ground station"""
    ABORT_MISSION = "ABORT_MISSION"
    PAUSE_MISSION = "PAUSE_MISSION"
    RESUME_MISSION = "RESUME_MISSION"
    RETURN_TO_HOME = "RETURN_TO_HOME"
    EMERGENCY_LAND = "EMERGENCY_LAND"
    UPDATE_MISSION = "UPDATE_MISSION"


class CommandPriority(str, Enum):
    """Command priority levels"""
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    EMERGENCY = "EMERGENCY"


class MissionCommand(BaseModel):
    """
    Command from Cloud Backend → Ground Station
    
    Used for mission control (abort, pause, resume).
    """
    command_id: str = Field(..., description="Unique command identifier")
    mission_id: str
    drone_id: str
    
    command_type: CommandType
    priority: CommandPriority = CommandPriority.NORMAL
    
    reason: Optional[str] = Field(None, max_length=500, description="Human-readable reason")
    
    # Additional parameters for specific commands
    parameters: Optional[dict] = None
    
    issued_by: Optional[str] = Field(None, description="User/system that issued command")
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "command_id": "CMD-20260211-001",
                "mission_id": "M-20260211-001",
                "drone_id": "D-ANAFI-001",
                "command_type": "ABORT_MISSION",
                "priority": "HIGH",
                "reason": "Weather conditions deteriorated",
                "issued_by": "operator-john"
            }
        }


class CommandResponse(BaseModel):
    """
    Response from Ground Station → Cloud Backend
    
    Acknowledges receipt and execution status of commands.
    """
    command_id: str
    mission_id: str
    drone_id: str
    
    accepted: bool
    executed: bool = False
    
    message: Optional[str] = None
    error: Optional[str] = None
    
    responded_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "command_id": "CMD-20260211-001",
                "mission_id": "M-20260211-001",
                "drone_id": "D-ANAFI-001",
                "accepted": True,
                "executed": True,
                "message": "Mission aborted, drone returning to home"
            }
        }
