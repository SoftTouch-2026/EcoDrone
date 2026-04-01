
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
from api.cloud_client import CloudClient
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
elif CONNECTION_MODE in ["skycontroller", "lte"]:
    delivery_ip = "192.168.53.1"
delivery = DeliveryController(ip_address=delivery_ip)

# Cloud Integration setup
CLOUD_API_URL = os.environ.get("CLOUD_API_URL", "http://localhost:3000")
DRONE_ID = os.environ.get("DRONE_ID", "DRN-001-2024")
SERVICE_SECRET = os.environ.get("SERVICE_SECRET", "eco_drone_ground_auth_v1_xyz")
cloud_client = CloudClient(delivery, CLOUD_API_URL, DRONE_ID, SERVICE_SECRET)


# ───────────────── Data ─────────────────

DELIVERY_LOCATIONS = [
    {
        "name": "Archer Cornfield Lower",
        "latitude": 5.759765224999998,
        "longitude": -0.220046349999447,
        "absolute_altitude": 354.7980041503906
    },
    {
        "name": "Archer Cornfield Upper",
        "latitude": 5.759706599999595,
        "longitude": -0.21993844499989734,
        "absolute_altitude": 355.8009948730469
    },
    {
        "name": "CS Department",
        "latitude": 5.7595037799990365,
        "longitude": -0.21953943500055573,
        "absolute_altitude": 356.0669860839844
    },
    {
        "name": "Cafeteria",
        "latitude": 5.758543319994385,
        "longitude": -0.21985313000163842,
        "absolute_altitude": 361.5530090332031
    },
    {
        "name": "Hostels Generator",
        "latitude": 5.758129449971031,
        "longitude": -0.22017107999947996,
        "absolute_altitude": 359.36700439453125
    },
    {
        "name": "Hostel-2E Rooftop",
        "latitude": 5.757190170016988,
        "longitude": -0.22101232998781767,
        "absolute_altitude": 351.3909912109375
    },
    {
        "name": "Hostel-2D Rooftop",
        "latitude": 5.7575989699940315,
        "longitude": -0.22124015000929376,
        "absolute_altitude": 346.1929931640625
    },
    {
        "name": "Hostel-KT Rooftop",
        "latitude": 5.758115784999068,
        "longitude": -0.22114700997528586,
        "absolute_altitude": 344.239990234375
    },
    {
        "name": "Munchies - Student Car Park",
        "latitude": 5.758773105004581,
        "longitude": -0.2211355499960092,
        "absolute_altitude": 339.6319885253906
    }
]


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


class UShapeMissionRequest(BaseModel):
    location_name: str = Field(..., description="Name of the delivery location")


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


# ───────────────── Lifecycle ─────────────────

@app.on_event("startup")
async def startup_event():
    await cloud_client.start()

@app.on_event("shutdown")
async def shutdown_event():
    await cloud_client.stop()


# ───────────────── Endpoints ─────────────────

@app.get("/")
def index():
    return {"name": "EcoDrone API", "version": "1.0.0", "status": "running"}


@app.get("/api/locations", response_model=ApiResponse)
def get_locations():
    """Get all available delivery locations"""
    return ApiResponse(
        success=True,
        data={"locations": DELIVERY_LOCATIONS}
    )


@app.get("/api/status", response_model=ApiResponse)
def get_status():
    try:
        status = drone.get_status()
        return ApiResponse(success=True, data=status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/telemetry", response_model=ApiResponse)
def get_telemetry():
    try:
        data = {
            "latitude": delivery.current_lat,
            "longitude": delivery.current_lon,
            "altitude": delivery.current_amsl,
            "heading": delivery.current_yaw,
            "speed_kmh": 0.0,
            "battery": getattr(delivery.drone, "battery_level", 0) if hasattr(delivery, "drone") else 100,
            "status": getattr(delivery, "flying_state", "landed"),
            "sats": delivery.satellites,
            "signal": delivery.link_quality
        }
        return ApiResponse(success=True, data=data)
    except Exception as e:
        logger.error(f"Telemetry error: {e}")
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
    
    # Share Olympe connection if standard drone controller is connected
    if hasattr(drone, "drone") and drone.drone is not None and not delivery.connected:
        delivery.drone = drone.drone
        delivery.connected = True
        delivery._start_monitoring()
        
    if not delivery.connected:
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


@app.post("/api/delivery/ushape", response_model=ApiResponse)
def start_ushape(body: UShapeMissionRequest, background_tasks: BackgroundTasks):
    """Start a U-Shape delivery mission"""
    loc = next((l for l in DELIVERY_LOCATIONS if l["name"] == body.location_name), None)
    if not loc:
        return ApiResponse(success=False, message="Location not found")
        
    if delivery._in_flight:
        return ApiResponse(success=False, message="A delivery mission is already in progress.")
    
    # Share Olympe connection from drone controller if available
    if hasattr(drone, "drone") and drone.drone is not None:
        delivery.drone = drone.drone
        delivery.connected = True
        if not delivery._monitor_thread or not delivery._monitor_thread.is_alive():
            delivery._start_monitoring()
        
    if not delivery.connected:
        connected = delivery.connect()
        if not connected:
            return ApiResponse(success=False, message="Failed to connect DeliveryController to drone.")
            
    background_tasks.add_task(delivery.execute_ushape_delivery, loc)
    return ApiResponse(success=True, message=f"U-Shape mission to {body.location_name} started in background.")


@app.post("/api/survey", response_model=ApiResponse)
def survey_location():
    """Trigger the Survey Mode to get highly accurate current GPS coordinates"""
    try:
        # Share Olympe connection if standard drone controller is connected
        if hasattr(drone, "drone") and drone.drone is not None and not delivery.connected:
            delivery.drone = drone.drone
            delivery.connected = True
            delivery._start_monitoring()
            
        if not delivery.connected and not delivery.drone:
            connected = delivery.connect()
            if not connected:
                return ApiResponse(success=False, message="Failed to connect to drone for survey.")
        
        result = delivery.survey_location()
        return ApiResponse(
            success=result.get("success", False), 
            message=result.get("message", "Survey complete"), 
            data=result
        )
    except Exception as e:
        logger.error(f"Survey error: {e}")
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
