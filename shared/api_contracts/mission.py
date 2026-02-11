"""
EcoDrone Shared API Contracts - Mission Data Structures

This module defines the mission-related data structures shared between
the Cloud Backend (delivery-app) and Ground Station (ground-station).
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class MissionState(str, Enum):
    """Mission lifecycle states"""
    PENDING = "PENDING"              # Mission created in backend
    ASSIGNED = "ASSIGNED"            # Assigned to specific drone
    ACKNOWLEDGED = "ACKNOWLEDGED"    # Ground station received it
    UPLOADED = "UPLOADED"            # Uploaded to drone's Air SDK
    IN_FLIGHT = "IN_FLIGHT"          # Drone is executing mission
    PAUSED = "PAUSED"                # Mission paused
    COMPLETED = "COMPLETED"          # Successfully completed
    ABORTED = "ABORTED"              # Manually aborted
    FAILED = "FAILED"                # Failed due to error


class GPSCoordinate(BaseModel):
    """Standard GPS coordinate format"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")
    altitude: Optional[float] = Field(None, description="Altitude in meters above sea level")

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 5.7596,
                "longitude": -0.2234,
                "altitude": 50.0
            }
        }


class MissionIntent(BaseModel):
    """
    Mission assignment from Cloud Backend → Ground Station
    
    This represents the business intent - what needs to be delivered where.
    The Ground Station compiles this into drone-executable waypoints.
    """
    mission_id: str = Field(..., description="Unique mission identifier")
    drone_id: str = Field(..., description="Assigned drone identifier")
    
    pickup_location: GPSCoordinate = Field(..., description="Package pickup coordinates")
    delivery_location: GPSCoordinate = Field(..., description="Package delivery coordinates")
    
    payload_weight_grams: int = Field(..., gt=0, description="Payload weight in grams")
    priority: int = Field(default=3, ge=1, le=5, description="Mission priority (1=low, 5=urgent)")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deadline: Optional[datetime] = Field(None, description="Delivery deadline")
    
    customer_id: Optional[str] = None
    special_instructions: Optional[str] = Field(None, max_length=500)

    class Config:
        json_schema_extra = {
            "example": {
                "mission_id": "M-20260211-001",
                "drone_id": "D-ANAFI-001",
                "pickup_location": {
                    "latitude": 5.7596,
                    "longitude": -0.2234,
                    "altitude": 50.0
                },
                "delivery_location": {
                    "latitude": 5.7610,
                    "longitude": -0.2250,
                    "altitude": 50.0
                },
                "payload_weight_grams": 350,
                "priority": 3,
                "customer_id": "C-12345"
            }
        }


class MissionStatus(BaseModel):
    """
    Status update from Ground Station → Cloud Backend
    
    Provides real-time mission progress and drone telemetry.
    """
    mission_id: str
    current_state: MissionState
    
    # Current position
    current_location: Optional[GPSCoordinate] = None
    
    # Drone health
    battery_level: int = Field(..., ge=0, le=100, description="Battery percentage")
    altitude_meters: Optional[float] = None
    
    # Progress estimates
    estimated_completion: Optional[datetime] = None
    distance_remaining_meters: Optional[float] = None
    
    # Error handling
    error_message: Optional[str] = None
    
    # Timestamp
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "mission_id": "M-20260211-001",
                "current_state": "IN_FLIGHT",
                "current_location": {
                    "latitude": 5.7603,
                    "longitude": -0.2242,
                    "altitude": 65.0
                },
                "battery_level": 78,
                "altitude_meters": 65.0,
                "estimated_completion": "2026-02-11T01:25:00Z"
            }
        }


class MissionAcknowledgment(BaseModel):
    """Ground Station acknowledges receipt of mission"""
    mission_id: str
    acknowledged: bool
    ground_station_id: str
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
