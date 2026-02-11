"""
EcoDrone Controller - Parrot ANAFI Ai Interface
================================================
This module provides a Python interface to control the Parrot ANAFI Ai drone
using the Olympe SDK. It supports both physical drones and the Sphinx simulator.

Sprint 0 Deliverable: "Hello World" - Take-off to 10m and Land

Author: EcoDrone Team - Ashesi University
Course: ICS 532 - Agile Software Engineering Methods
"""

import os
import time
import threading
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional, Callable
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EcoDrone")

# Try to import Olympe - if not available, use simulation mode
try:
    import olympe
    from olympe.messages.ardrone3.Piloting import TakeOff, Landing, moveBy
    from olympe.messages.ardrone3.PilotingState import FlyingStateChanged
    from olympe.messages.common.CommonState import BatteryStateChanged
    from olympe.messages.ardrone3.PilotingState import AltitudeChanged
    OLYMPE_AVAILABLE = True
    logger.info("Olympe SDK loaded successfully")
except ImportError:
    OLYMPE_AVAILABLE = False
    logger.warning("Olympe SDK not available - running in SIMULATION mode")


class DroneState(Enum):
    """Possible states of the drone"""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    TAKING_OFF = "taking_off"
    HOVERING = "hovering"
    FLYING = "flying"
    LANDING = "landing"
    LANDED = "landed"
    EMERGENCY = "emergency"
    ERROR = "error"


class ConnectionMode(Enum):
    """Connection modes for the drone"""
    SIMULATION = "simulation"       # Sphinx simulator (10.202.0.1)
    WIFI_DIRECT = "wifi_direct"     # Direct WiFi to drone (192.168.42.1)
    SKYCONTROLLER = "skycontroller" # Via SkyController 4 (192.168.53.1)


@dataclass
class DroneStatus:
    """Current status of the drone"""
    state: DroneState = DroneState.DISCONNECTED
    altitude: float = 0.0           # meters
    battery_level: float = 100.0    # percentage
    latitude: float = 5.7597        # Ashesi University coordinates
    longitude: float = -0.2199
    speed: float = 0.0              # m/s
    message: str = "Drone not connected"
    connected: bool = False
    connection_mode: str = "none"
    drone_model: str = "ANAFI Ai"
    last_updated: float = field(default_factory=time.time)

    def to_dict(self):
        return {
            "state": self.state.value,
            "altitude": round(self.altitude, 2),
            "battery_level": round(self.battery_level, 1),
            "latitude": self.latitude,
            "longitude": self.longitude,
            "speed": round(self.speed, 2),
            "message": self.message,
            "connected": self.connected,
            "connection_mode": self.connection_mode,
            "drone_model": self.drone_model,
            "last_updated": self.last_updated,
            "olympe_available": OLYMPE_AVAILABLE
        }


class DroneSimulator:
    """
    Simulates drone behavior when Olympe SDK is not available.
    Useful for frontend development and testing without hardware.
    """
    
    def __init__(self):
        self.status = DroneStatus()
        self._simulation_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._lock = threading.Lock()
        
    def connect(self) -> bool:
        with self._lock:
            self.status.connected = True
            self.status.state = DroneState.LANDED
            self.status.connection_mode = "simulation"
            self.status.message = "Connected (Simulation Mode)"
            self.status.battery_level = 87.0
        return True
    
    def disconnect(self) -> bool:
        with self._lock:
            self._stop_event.set()
            self.status.connected = False
            self.status.state = DroneState.DISCONNECTED
            self.status.message = "Disconnected"
        return True
    
    def takeoff(self) -> dict:
        with self._lock:
            if not self.status.connected:
                return {"success": False, "message": "Drone not connected"}
            if self.status.state not in [DroneState.LANDED, DroneState.CONNECTED]:
                return {"success": False, "message": f"Cannot takeoff from state: {self.status.state.value}"}
            if self.status.battery_level < 20:
                return {"success": False, "message": f"Battery too low: {self.status.battery_level}%"}
            
            self.status.state = DroneState.TAKING_OFF
            self.status.message = "Taking off..."
        
        # Simulate takeoff in background
        self._stop_event.clear()
        self._simulation_thread = threading.Thread(target=self._simulate_takeoff)
        self._simulation_thread.start()
        
        return {"success": True, "message": "Takeoff initiated"}
    
    def _simulate_takeoff(self):
        target_altitude = 10.0
        while not self._stop_event.is_set() and self.status.altitude < target_altitude:
            time.sleep(0.5)
            with self._lock:
                self.status.altitude = min(self.status.altitude + 1.0, target_altitude)
                self.status.battery_level = max(0, self.status.battery_level - 0.1)
                self.status.message = f"Ascending... {self.status.altitude}m"
        
        with self._lock:
            if not self._stop_event.is_set():
                self.status.state = DroneState.HOVERING
                self.status.message = f"Hovering at {self.status.altitude}m"
    
    def land(self) -> dict:
        with self._lock:
            if not self.status.connected:
                return {"success": False, "message": "Drone not connected"}
            if self.status.state == DroneState.LANDED:
                return {"success": False, "message": "Drone already landed"}
            
            self._stop_event.set()
            self.status.state = DroneState.LANDING
            self.status.message = "Landing..."
        
        # Simulate landing in background
        self._stop_event.clear()
        self._simulation_thread = threading.Thread(target=self._simulate_landing)
        self._simulation_thread.start()
        
        return {"success": True, "message": "Landing initiated"}
    
    def _simulate_landing(self):
        while not self._stop_event.is_set() and self.status.altitude > 0:
            time.sleep(0.5)
            with self._lock:
                self.status.altitude = max(0, self.status.altitude - 1.5)
                self.status.battery_level = max(0, self.status.battery_level - 0.05)
                self.status.message = f"Descending... {self.status.altitude}m"
        
        with self._lock:
            self.status.altitude = 0
            self.status.state = DroneState.LANDED
            self.status.message = "Landed safely"
    
    def get_status(self) -> dict:
        with self._lock:
            self.status.last_updated = time.time()
            return self.status.to_dict()


class ParrotANAFIController:
    """
    Controller for Parrot ANAFI Ai drone using Olympe SDK.
    
    Supports:
    - Direct WiFi connection to drone (192.168.42.1)
    - Connection via SkyController 4 (192.168.53.1)
    - Sphinx simulator (10.202.0.1)
    """
    
    # IP Addresses for different connection modes
    IP_ADDRESSES = {
        ConnectionMode.SIMULATION: "10.202.0.1",
        ConnectionMode.WIFI_DIRECT: "192.168.42.1",
        ConnectionMode.SKYCONTROLLER: "192.168.53.1"
    }
    
    # Target altitude for takeoff (as per M-US1.2)
    TARGET_ALTITUDE = 10.0  # meters
    
    # Minimum battery for flight (as per M-US1.3)
    MIN_BATTERY = 20.0  # percentage
    
    def __init__(self, connection_mode: ConnectionMode = ConnectionMode.WIFI_DIRECT):
        self.connection_mode = connection_mode
        self.drone_ip = self.IP_ADDRESSES[connection_mode]
        self.drone: Optional['olympe.Drone'] = None
        self.status = DroneStatus()
        self._lock = threading.Lock()
        self._status_thread: Optional[threading.Thread] = None
        self._stop_status_updates = threading.Event()
        
        logger.info(f"Initialized ParrotANAFIController")
        logger.info(f"Connection Mode: {connection_mode.value}")
        logger.info(f"Drone IP: {self.drone_ip}")
    
    def connect(self) -> dict:
        """Connect to the ANAFI Ai drone"""
        if not OLYMPE_AVAILABLE:
            return {"success": False, "message": "Olympe SDK not installed"}
        
        try:
            with self._lock:
                self.status.state = DroneState.CONNECTING
                self.status.message = f"Connecting to {self.drone_ip}..."
            
            # Create drone instance
            self.drone = olympe.Drone(self.drone_ip)
            
            # Attempt connection
            success = self.drone.connect()
            
            if success:
                with self._lock:
                    self.status.connected = True
                    self.status.state = DroneState.CONNECTED
                    self.status.connection_mode = self.connection_mode.value
                    self.status.message = "Connected to ANAFI Ai"
                
                # Start status update thread
                self._start_status_updates()
                
                logger.info("Successfully connected to drone")
                return {"success": True, "message": "Connected to ANAFI Ai"}
            else:
                with self._lock:
                    self.status.state = DroneState.ERROR
                    self.status.message = "Connection failed"
                return {"success": False, "message": "Failed to connect to drone"}
                
        except Exception as e:
            logger.error(f"Connection error: {e}")
            with self._lock:
                self.status.state = DroneState.ERROR
                self.status.message = f"Connection error: {str(e)}"
            return {"success": False, "message": str(e)}
    
    def disconnect(self) -> dict:
        """Disconnect from the drone"""
        try:
            self._stop_status_updates.set()
            
            if self.drone:
                self.drone.disconnect()
            
            with self._lock:
                self.status.connected = False
                self.status.state = DroneState.DISCONNECTED
                self.status.message = "Disconnected"
            
            logger.info("Disconnected from drone")
            return {"success": True, "message": "Disconnected"}
            
        except Exception as e:
            logger.error(f"Disconnect error: {e}")
            return {"success": False, "message": str(e)}
    
    def takeoff(self) -> dict:
        """
        Command the drone to take off to target altitude (10m).
        Implements M-US1.2: "take-off to 10m" command
        """
        if not self.drone or not self.status.connected:
            return {"success": False, "message": "Drone not connected"}
        
        # Check battery level (M-US1.3 requirement)
        if self.status.battery_level < self.MIN_BATTERY:
            msg = f"Battery too low ({self.status.battery_level}%). Minimum: {self.MIN_BATTERY}%"
            logger.warning(msg)
            return {"success": False, "message": msg}
        
        try:
            with self._lock:
                self.status.state = DroneState.TAKING_OFF
                self.status.message = "Taking off..."
            
            # Send takeoff command and wait for completion
            result = self.drone(
                TakeOff()
                >> FlyingStateChanged(state="hovering", _timeout=30)
            ).wait()
            
            if result.success():
                with self._lock:
                    self.status.state = DroneState.HOVERING
                    self.status.message = f"Hovering at altitude"
                logger.info("Takeoff successful")
                return {"success": True, "message": "Takeoff successful - now hovering"}
            else:
                with self._lock:
                    self.status.state = DroneState.ERROR
                    self.status.message = "Takeoff failed"
                return {"success": False, "message": "Takeoff command failed"}
                
        except Exception as e:
            logger.error(f"Takeoff error: {e}")
            with self._lock:
                self.status.state = DroneState.ERROR
                self.status.message = f"Takeoff error: {str(e)}"
            return {"success": False, "message": str(e)}
    
    def land(self) -> dict:
        """
        Command the drone to land.
        Implements M-US1.2: "land" command
        """
        if not self.drone or not self.status.connected:
            return {"success": False, "message": "Drone not connected"}
        
        try:
            with self._lock:
                self.status.state = DroneState.LANDING
                self.status.message = "Landing..."
            
            # Send landing command and wait for completion
            result = self.drone(
                Landing()
                >> FlyingStateChanged(state="landed", _timeout=60)
            ).wait()
            
            if result.success():
                with self._lock:
                    self.status.state = DroneState.LANDED
                    self.status.altitude = 0
                    self.status.message = "Landed safely"
                logger.info("Landing successful")
                return {"success": True, "message": "Landing successful"}
            else:
                with self._lock:
                    self.status.state = DroneState.ERROR
                    self.status.message = "Landing failed"
                return {"success": False, "message": "Landing command failed"}
                
        except Exception as e:
            logger.error(f"Landing error: {e}")
            with self._lock:
                self.status.state = DroneState.ERROR
                self.status.message = f"Landing error: {str(e)}"
            return {"success": False, "message": str(e)}
    
    def _start_status_updates(self):
        """Start background thread to update drone status"""
        self._stop_status_updates.clear()
        self._status_thread = threading.Thread(target=self._update_status_loop)
        self._status_thread.daemon = True
        self._status_thread.start()
    
    def _update_status_loop(self):
        """Continuously update drone status from telemetry"""
        while not self._stop_status_updates.is_set():
            try:
                if self.drone and self.status.connected:
                    # Get battery state
                    battery_state = self.drone.get_state(BatteryStateChanged)
                    if battery_state:
                        with self._lock:
                            self.status.battery_level = battery_state.get("percent", 0)
                    
                    # Get altitude
                    altitude_state = self.drone.get_state(AltitudeChanged)
                    if altitude_state:
                        with self._lock:
                            self.status.altitude = altitude_state.get("altitude", 0)
                    
                    # Get flying state
                    flying_state = self.drone.get_state(FlyingStateChanged)
                    if flying_state:
                        state_map = {
                            "landed": DroneState.LANDED,
                            "takingoff": DroneState.TAKING_OFF,
                            "hovering": DroneState.HOVERING,
                            "flying": DroneState.FLYING,
                            "landing": DroneState.LANDING,
                            "emergency": DroneState.EMERGENCY
                        }
                        state_value = flying_state.get("state", "")
                        if state_value in state_map:
                            with self._lock:
                                self.status.state = state_map[state_value]
                
            except Exception as e:
                logger.error(f"Status update error: {e}")
            
            time.sleep(0.5)  # Update every 500ms
    
    def get_status(self) -> dict:
        """Get current drone status"""
        with self._lock:
            self.status.last_updated = time.time()
            return self.status.to_dict()


# Factory function to get the appropriate controller
def get_drone_controller(mode: str = "auto"):
    """
    Factory function to create the appropriate drone controller.
    
    Args:
        mode: "auto", "simulation", "wifi", or "skycontroller"
    
    Returns:
        DroneController instance (real or simulated)
    """
    if mode == "simulation" or not OLYMPE_AVAILABLE:
        logger.info("Using DroneSimulator (Olympe not available or simulation requested)")
        return DroneSimulator()
    
    if mode == "wifi":
        return ParrotANAFIController(ConnectionMode.WIFI_DIRECT)
    elif mode == "skycontroller":
        return ParrotANAFIController(ConnectionMode.SKYCONTROLLER)
    elif mode == "sphinx":
        return ParrotANAFIController(ConnectionMode.SIMULATION)
    else:
        # Auto mode - try WiFi direct first
        return ParrotANAFIController(ConnectionMode.WIFI_DIRECT)


# Test the controller
if __name__ == "__main__":
    print("=" * 50)
    print("EcoDrone Controller Test")
    print("=" * 50)
    
    # Create controller (will use simulator if Olympe not available)
    controller = get_drone_controller("auto")
    
    print(f"\nOlympe Available: {OLYMPE_AVAILABLE}")
    print(f"Controller Type: {type(controller).__name__}")
    
    # Test status
    status = controller.get_status()
    print(f"\nInitial Status: {status}")
    
    # Test connection
    print("\nConnecting...")
    result = controller.connect()
    print(f"Connect Result: {result}")
    
    # Test status after connect
    status = controller.get_status()
    print(f"Status After Connect: {status}")
    
    print("\nController ready for API integration!")
