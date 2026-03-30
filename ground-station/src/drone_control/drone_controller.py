"""
Ground Station Drone Controller
Handles flight operations for Parrot Anafi AI drones using Olympe SDK
Runs on Ubuntu 22.04 ground station, NOT on Raspberry Pi

Communication: WiFi (~300m) → SkyController (2-4km LOS) → LTE (campus-wide)
"""

import time
from datetime import datetime
from typing import Optional
import olympe
from olympe.messages.ardrone3.Piloting import TakeOff, Landing, moveBy, moveTo
from olympe.messages.ardrone3.PilotingState import FlyingStateChanged, PositionChanged, moveToChanged
from olympe.messages.common.CommonState import BatteryStateChanged

from models.drone_model import Drone
from config import DEFAULT_TAKEOFF_ALTITUDE


class DroneController:
    """Controls a drone's flight operations from the ground station"""
    
    def __init__(self, drone: Drone):
        self.drone = drone
        self.olympe_drone: Optional[olympe.Drone] = None
        self.is_connected = False
        self.flight_log = []
        print(f"\n{'='*60}")
        print(f"Ground Station Controller initialized for: {drone.name}")
        print(f"Drone IP: {drone.ip_address}")
        print(f"{'='*60}\n")
    
    def connect(self) -> bool:
        """Connect to the drone via WiFi/LTE"""
        print(f"🔗 Connecting to drone at {self.drone.ip_address}...")
        try:
            self.olympe_drone = olympe.Drone(self.drone.ip_address)
            if self.olympe_drone.connect():
                self.is_connected = True
                print(f"✓ Connected to {self.drone.name}")
                self.drone.update_status("active")
                return True
            print(f"✗ Failed to connect")
            return False
        except Exception as e:
            print(f"✗ Connection error: {e}")
            return False
    
    def disconnect(self) -> bool:
        """Disconnect from the drone"""
        if self.is_connected and self.olympe_drone:
            print(f"🔌 Disconnecting from {self.drone.name}...")
            self.olympe_drone.disconnect()
            self.is_connected = False
            self.drone.update_status("inactive")
            print(f"✓ Disconnected")
            return True
        return True
    
    def takeoff(self, altitude: float = DEFAULT_TAKEOFF_ALTITUDE) -> bool:
        """Command the drone to take off"""
        if not self._pre_flight_check():
            return False
        
        print(f"\n🚁 Initiating takeoff to {altitude}m...")
        try:
            self.drone.update_status("in_flight")
            success = self.olympe_drone(TakeOff() >> FlyingStateChanged(state="hovering", _timeout=10)).wait().success()
            if success:
                print(f"✓ Takeoff successful")
                self.drone.update_location(self.drone.current_location['lat'], self.drone.current_location['lon'], altitude)
                self.drone.last_flight_date = datetime.now().isoformat()
                return True
            print("✗ Takeoff failed")
            self.drone.update_status("active")
            return False
        except Exception as e:
            print(f"✗ Takeoff error: {e}")
            self.drone.update_status("active")
            return False
    
    def land(self) -> bool:
        """Command the drone to land"""
        if not self.is_connected:
            print("✗ Drone not connected")
            return False
        
        print(f"\n🛬 Initiating landing...")
        try:
            success = self.olympe_drone(Landing() >> FlyingStateChanged(state="landed", _timeout=10)).wait().success()
            if success:
                print("✓ Landing successful")
                self.drone.update_status("active")
                self.drone.update_location(self.drone.current_location['lat'], self.drone.current_location['lon'], 0)
                return True
            print("✗ Landing failed")
            return False
        except Exception as e:
            print(f"✗ Landing error: {e}")
            return False
    
    def fly_to_coordinates(self, latitude: float, longitude: float, altitude: float = 10) -> bool:
        """Command the drone to fly to GPS coordinates"""
        if not self.is_connected or self.drone.status != "in_flight":
            print("⚠ Drone must be in flight. Call takeoff() first.")
            return False
        
        print(f"\n📍 Navigating to Lat {latitude }, Lon {longitude}, Alt {altitude}m...")
        try:
            # Orientation mode 0 (TO_TARGET), heading 0
            # Wait for either DONE or CANCELED
            result = self.olympe_drone(
                moveTo(latitude, longitude, altitude, 0, 0) 
                >> (moveToChanged(status="DONE", _timeout=3600) | moveToChanged(status="CANCELED", _timeout=3600))
            ).wait()
            
            if result.success():
                print(f"✓ Navigation successful")
                self.drone.update_location(latitude, longitude, altitude)
                return True
            print("✗ Navigation failed")
            return False
        except Exception as e:
            print(f"✗ Navigation error: {e}")
            return False
    
    def get_battery_level(self) -> Optional[int]:
        """Get current battery level from the drone"""
        if not self.is_connected:
            return None
        try:
            battery_state = self.olympe_drone.get_state(BatteryStateChanged)
            if battery_state:
                level = battery_state["percent"]
                self.drone.update_battery(level)
                return level
            return None
        except Exception as e:
            print(f"⚠ Error reading battery: {e}")
            return None
    
    def _pre_flight_check(self) -> bool:
        """Perform pre-flight safety checks"""
        print("\n🔍 Pre-flight checks...")
        if not self.is_connected:
            print("✗ Drone not connected")
            return False
        
        is_ready, reason = self.drone.is_flight_ready()
        if not is_ready:
            print(f"✗ {reason}")
            return False
        
        battery = self.get_battery_level()
        if battery and battery < self.drone.min_battery_level:
            print(f"✗ Battery too low: {battery}%")
            return False
        
        print("✓ All checks passed")
        return True
