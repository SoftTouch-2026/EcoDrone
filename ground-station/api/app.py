
"""
EcoDrone API Server - FastAPI Version
"""

import os
import sys

# Add controllers directory to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
controllers_dir = os.path.join(os.path.dirname(current_dir), 'controllers')
sys.path.append(controllers_dir)

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Tuple
from drone_controller import get_drone_controller, OLYMPE_AVAILABLE
from delivery_controller import DeliveryController
import logging
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EcoDrone-API")

app = FastAPI(
    title="EcoDrone API",
    description="Ground Station API for Parrot ANAFI Ai drone control",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONNECTION_MODE = os.environ.get("DRONE_CONNECTION_MODE", "auto")
drone = get_drone_controller(CONNECTION_MODE)

# Delivery Controller setup
delivery_ip = "192.168.42.1"
if CONNECTION_MODE == "simulation":
    delivery_ip = "10.202.0.1"
elif CONNECTION_MODE == "skycontroller":
    delivery_ip = "192.168.53.1"
delivery = DeliveryController(ip_address=delivery_ip)


# ───────────────── Request / Response Models ─────────────────

class NavigateRequest(BaseModel):
    latitude: float = Field(..., description="Target latitude (decimal degrees)")
    longitude: float = Field(..., description="Target longitude (decimal degrees)")
    altitude: float = Field(10.0, description="Target altitude in metres")


class MoveRequest(BaseModel):
    forward: float = Field(0.0, description="Forward distance in metres")
    right: float = Field(0.0, description="Right distance in metres")
    up: float = Field(0.0, description="Up distance in metres")
    rotation: float = Field(0.0, description="Rotation in degrees")


class DeliveryMissionRequest(BaseModel):
    waypoints: List[Tuple[float, float]] = Field(..., description="List of (latitude, longitude) tuples")


class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
    data: Optional[dict] = None


# ───────────────── Helper ─────────────────

def _parse_result(result, default_message: str) -> tuple[bool, str]:
    """Parse controller result into (success, message)."""
    if isinstance(result, dict):
        return result.get("success", True), result.get("message", default_message)
    return bool(result), default_message if result else f"{default_message} failed"


# ───────────────── Endpoints ─────────────────

@app.get("/")
def index():
    return {"name": "EcoDrone API", "version": "1.0.0", "status": "running"}


@app.get("/api/status", response_model=ApiResponse)
def get_status():
    try:
        status = drone.get_status()
        return ApiResponse(success=True, data=status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/connect", response_model=ApiResponse)
def connect():
    try:
        result = drone.connect()
        success, message = _parse_result(result, "Connected")
        return ApiResponse(success=success, message=message, data=drone.get_status())
    except Exception as e:
        logger.error(f"Connect error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/disconnect", response_model=ApiResponse)
def disconnect():
    try:
        result = drone.disconnect()
        success, message = _parse_result(result, "Disconnected")
        return ApiResponse(success=success, message=message, data=drone.get_status())
    except Exception as e:
        logger.error(f"Disconnect error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/takeoff", response_model=ApiResponse)
def takeoff():
    try:
        status = drone.get_status()
        if not status.get("connected", False):
            return ApiResponse(success=False, message="Drone not connected", data=status)

        battery = status.get("battery_level", 0)
        if battery < 20:
            return ApiResponse(
                success=False,
                message=f"Battery too low ({battery}%)",
                data=status,
            )

        result = drone.takeoff()
        success, message = _parse_result(result, "Taking off")
        return ApiResponse(success=success, message=message, data=drone.get_status())
    except Exception as e:
        logger.error(f"Takeoff error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/land", response_model=ApiResponse)
def land():
    try:
        status = drone.get_status()
        if not status.get("connected", False):
            return ApiResponse(success=False, message="Drone not connected", data=status)

        result = drone.land()
        success, message = _parse_result(result, "Landing")
        return ApiResponse(success=success, message=message, data=drone.get_status())
    except Exception as e:
        logger.error(f"Land error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/navigate", response_model=ApiResponse)
def navigate(body: NavigateRequest):
    """Fly to GPS coordinates (equivalent to CLI 'goto' command)"""
    try:
        status = drone.get_status()
        if not status.get("connected", False):
            return ApiResponse(success=False, message="Drone not connected", data=status)

        result = drone.fly_to_coordinates(body.latitude, body.longitude, body.altitude)
        success, message = _parse_result(result, "Navigating")
        return ApiResponse(success=success, message=message, data=drone.get_status())
    except Exception as e:
        logger.error(f"Navigate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/move", response_model=ApiResponse)
def move(body: MoveRequest):
    """Move relative to current position (equivalent to CLI 'move' command)"""
    try:
        status = drone.get_status()
        if not status.get("connected", False):
            return ApiResponse(success=False, message="Drone not connected", data=status)

        result = drone.move_by(body.forward, body.right, body.up, body.rotation)
        success, message = _parse_result(result, "Moving")
        return ApiResponse(success=success, message=message, data=drone.get_status())
    except Exception as e:
        logger.error(f"Move error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/battery", response_model=ApiResponse)
def battery():
    """Get battery level"""
    try:
        status = drone.get_status()
        return ApiResponse(
            success=True,
            data={
                "battery_level": status.get("battery_level", 0),
                "connected": status.get("connected", False),
            },
        )
    except Exception as e:
        logger.error(f"Battery error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/delivery/start", response_model=ApiResponse)
def start_delivery(body: DeliveryMissionRequest, background_tasks: BackgroundTasks):
    """Start an autonomous delivery mission using the DeliveryController"""
    if delivery.connected or delivery.drone:
        return ApiResponse(success=False, message="Delivery mission already running or controller connected.")
    
    # We must connect first before doing the flight logic
    connected = delivery.connect()
    if not connected:
        return ApiResponse(success=False, message="Failed to connect DeliveryController to drone.")
        
    background_tasks.add_task(delivery.execute_delivery, body.waypoints)
    return ApiResponse(success=True, message="Delivery mission started in the background")


@app.post("/api/delivery/abort", response_model=ApiResponse)
def abort_delivery():
    """Trigger manual override and abort the delivery mission"""
    try:
        delivery.trigger_manual_override()
        return ApiResponse(success=True, message="Manual override triggered, mission aborted.")
    except Exception as e:
        logger.error(f"Abort error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def health():
    return {"status": "healthy", "olympe": OLYMPE_AVAILABLE}


if __name__ == "__main__":
    print("=" * 50)
    print("  EcoDrone API Server (FastAPI)")
    print("=" * 50)
    print(f"  Olympe SDK: {OLYMPE_AVAILABLE}")
    print(f"  Mode: {CONNECTION_MODE}")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=5001)
