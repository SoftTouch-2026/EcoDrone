"""
EcoDrone Shared API Contracts - Telemetry Data Structures

This module defines telemetry data formats for real-time drone monitoring.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from .mission import GPSCoordinate


class DroneHealth(BaseModel):
    """Comprehensive drone health status"""
    drone_id: str
    
    # Power
    battery_level: int = Field(..., ge=0, le=100)
    battery_voltage: Optional[float] = None
    battery_temperature: Optional[float] = None
    
    # Connectivity
    signal_strength: Optional[int] = Field(None, ge=0, le=100, description="WiFi/LTE signal %")
    connection_type: Optional[str] = Field(None, description="wifi, skycontroller, lte")
    
    # Flight status
    is_connected: bool
    is_flying: bool
    altitude_meters: Optional[float] = None
    speed_mps: Optional[float] = Field(None, description="Speed in meters per second")
    
    # Environmental
    gps_accuracy: Optional[float] = Field(None, description="GPS accuracy in meters")
    satellites_visible: Optional[int] = None
    
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TelemetryUpdate(BaseModel):
    """
    Real-time telemetry packet from Ground Station → Cloud Backend
    
    Sent periodically (e.g., every 2 seconds) during active missions.
    """
    drone_id: str
    mission_id: Optional[str] = None
    
    # Position
    position: GPSCoordinate
    heading: Optional[float] = Field(None, ge=0, lt=360, description="Heading in degrees")
    
    # Velocity
    speed_mps: Optional[float] = None
    vertical_speed_mps: Optional[float] = None
    
    # Health
    battery_level: int = Field(..., ge=0, le=100)
    signal_strength: Optional[int] = None
    
    # State
    flight_state: str = Field(..., description="landed, taking_off, hovering, flying, landing")
    
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "drone_id": "D-ANAFI-001",
                "mission_id": "M-20260211-001",
                "position": {
                    "latitude": 5.7603,
                    "longitude": -0.2242,
                    "altitude": 65.0
                },
                "heading": 135.5,
                "speed_mps": 5.2,
                "battery_level": 78,
                "flight_state": "flying"
            }
        }


class DroneRegistry(BaseModel):
    """Drone registration/identification data"""
    drone_id: str
    serial_number: str
    model: str = "ANAFI-Ai"
    firmware_version: Optional[str] = None
    
    # Capabilities
    max_payload_grams: int = Field(default=500)
    max_range_meters: int = Field(default=4000)
    max_altitude_meters: int = Field(default=120)
    
    # Status
    status: str = Field(..., description="available, in_mission, maintenance, offline")
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    
    # Location when not flying
    home_location: Optional[GPSCoordinate] = None
