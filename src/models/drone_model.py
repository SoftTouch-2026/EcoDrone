"""
Drone data model
Defines the structure and properties of a drone in the EcoDrone system
Note: Environmental sensors (temp, CO, CO₂) are NOT on the drone - they're on Raspberry Pi 3
"""

from datetime import datetime
from typing import List, Dict, Optional


class Drone:
    """
    Represents a drone in the EcoDrone fleet
    
    Attributes:
        drone_id: Unique identifier for the drone
        name: Human-readable name for the drone
        ip_address: IP address to connect to the drone (usually 192.168.42.1)
        battery_capacity: Battery capacity in mAh
        min_battery_level: Minimum safe battery level (percentage)
        status: Current status (active, inactive, charging, in_flight, maintenance)
        current_battery_level: Current battery percentage (0-100)
        current_location: Current GPS coordinates {lat, lon, alt}
       registration_date: When the drone was registered
        last_flight_date: When the drone last flew
    """
    
    def __init__(
        self,
        drone_id: str,
        name: str,
        ip_address: str,
        battery_capacity: int = 4900,
        min_battery_level: int = 20,
        status: str = "inactive",
        current_battery_level: int = 100,
        current_location: Optional[Dict[str, float]] = None,
        registration_date: Optional[str] = None,
        last_flight_date: Optional[str] = None
    ):
        self.drone_id = drone_id
        self.name = name
        self.ip_address = ip_address
        self.battery_capacity = battery_capacity
        self.min_battery_level = min_battery_level
        self.status = status
        self.current_battery_level = current_battery_level
        self.current_location = current_location or {"lat": 0.0, "lon": 0.0, "alt": 0.0}
        self.registration_date = registration_date or datetime.now().isoformat()
        self.last_flight_date = last_flight_date
    
    def to_dict(self) -> Dict:
        """Convert drone object to dictionary for JSON serialization"""
        return {
            "drone_id": self.drone_id,
            "name": self.name,
            "ip_address": self.ip_address,
            "battery_capacity": self.battery_capacity,
            "min_battery_level": self.min_battery_level,
            "status": self.status,
            "current_battery_level": self.current_battery_level,
            "current_location": self.current_location,
            "registration_date": self.registration_date,
            "last_flight_date": self.last_flight_date
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Drone':
        """Create a drone object from a dictionary"""
        return cls(
            drone_id=data["drone_id"],
            name=data["name"],
            ip_address=data["ip_address"],
            battery_capacity=data.get("battery_capacity", 4900),
            min_battery_level=data.get("min_battery_level", 20),
            status=data.get("status", "inactive"),
            current_battery_level=data.get("current_battery_level", 100),
            current_location=data.get("current_location", {"lat": 0.0, "lon": 0.0, "alt": 0.0}),
            registration_date=data.get("registration_date"),
            last_flight_date=data.get("last_flight_date")
        )
    
    def is_flight_ready(self) -> tuple[bool, str]:
        """Check if the drone is ready to fly"""
        if self.status == "maintenance":
            return False, "Drone is under maintenance"
        if self.status == "in_flight":
            return False, "Drone is already in flight"
        if self.current_battery_level < self.min_battery_level:
            return False, f"Battery level ({self.current_battery_level}%) is below minimum ({self.min_battery_level}%)"
        return True, "Drone is ready for flight"
    
    def update_battery(self, level: int):
        """Update the drone's battery level"""
        self.current_battery_level = max(0, min(100, level))
    
    def update_location(self, latitude: float, longitude: float, altitude: float):
        """Update the drone's current location"""
        self.current_location = {"lat": latitude, "lon": longitude, "alt": altitude}
    
    def update_status(self, new_status: str):
        """Update the drone's status"""
        valid_statuses = ["active", "inactive", "charging", "in_flight", "maintenance"]
        if new_status in valid_statuses:
            self.status = new_status
        else:
            raise ValueError(f"Invalid status: {new_status}. Must be one of {valid_statuses}")
    
    def __str__(self) -> str:
        return f"Drone({self.drone_id}, {self.name}, Battery: {self.current_battery_level}%, Status: {self.status})"
    
    def __repr__(self) -> str:
        return f"Drone(id={self.drone_id}, name={self.name}, ip={self.ip_address}, battery={self.current_battery_level}%)"
