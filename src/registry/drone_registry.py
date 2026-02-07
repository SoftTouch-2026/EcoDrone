"""
Drone Registry System
Manages the fleet of drones - registration, updates, and queries
"""

import json
import os
from typing import List, Optional, Dict

from models.drone_model import Drone
from config import DRONE_REGISTRY_FILE


class DroneRegistry:
    """Manages the registry of all drones in the EcoDrone system"""
    
    def __init__(self, registry_file: str = DRONE_REGISTRY_FILE):
        self.registry_file = registry_file
        self.drones: Dict[str, Drone] = {}
        self.load_registry()
    
    def load_registry(self):
        """Load all drones from the registry file"""
        if os.path.exists(self.registry_file):
            try:
                with open(self.registry_file, 'r') as file:
                    data = json.load(file)
                    self.drones = {drone_id: Drone.from_dict(drone_data) for drone_id, drone_data in data.items()}
                print(f"✓ Loaded {len(self.drones)} drone(s) from registry")
            except Exception as e:
                print(f"✗ Error loading registry: {e}")
                self.drones = {}
        else:
            print("✓ Creating new drone registry")
            self.drones = {}
            self.save_registry()
    
    def save_registry(self):
        """Save all drones to the registry file"""
        try:
            data = {drone_id: drone.to_dict() for drone_id, drone in self.drones.items()}
            with open(self.registry_file, 'w') as file:
                json.dump(data, file, indent=2)
            print(f"✓ Registry saved ({len(self.drones)} drone(s))")
            return True
        except Exception as e:
            print(f"✗ Error saving registry: {e}")
            return False
    
    def register_drone(self, drone_id: str, name: str, ip_address: str, battery_capacity: int = 4900, min_battery_level: int = 20) -> Optional[Drone]:
        """Register a new drone in the system"""
        if drone_id in self.drones:
            print(f"✗ Drone {drone_id} is already registered")
            return None
        
        drone = Drone(
            drone_id=drone_id,
            name=name,
            ip_address=ip_address,
            battery_capacity=battery_capacity,
            min_battery_level=min_battery_level,
            status="active",
            current_battery_level=0
        )
        
        self.drones[drone_id] = drone
        if self.save_registry():
            print(f"✓ Drone {drone_id} ({name}) registered successfully")
            return drone
        else:
            del self.drones[drone_id]
            return None
    
    def get_drone(self, drone_id: str) -> Optional[Drone]:
        """Get a drone by its ID"""
        return self.drones.get(drone_id)
    
    def get_all_drones(self) -> List[Drone]:
        """Get all registered drones"""
        return list(self.drones.values())
    
    def update_drone(self, drone: Drone) -> bool:
        """Update an existing drone's information"""
        if drone.drone_id not in self.drones:
            print(f"✗ Drone {drone.drone_id} not found in registry")
            return False
        self.drones[drone.drone_id] = drone
        return self.save_registry()
    
    def list_drones(self):
        """Print a formatted list of all drones"""
        drones = self.get_all_drones()
        if not drones:
            print("No drones found in registry")
            return
        
        print(f"\n{'='*80}")
        print(f"DRONE REGISTRY - {len(drones)} Drone(s)")
        print(f"{'='*80}")
        for drone in drones:
            print(f"\n[{drone.drone_id}] {drone.name}")
            print(f"  IP: {drone.ip_address} | Status: {drone.status} | Battery: {drone.current_battery_level}%")
        print(f"\n{'='*80}\n")
