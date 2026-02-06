#!/usr/bin/env python3
"""
Epic 1 Demonstration Script
Demonstrates M-US1.1, M-US1.2, M-US1.3
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from registry.drone_registry import DroneRegistry
from drone_control.drone_controller import DroneController
from monitoring.battery_monitor import BatteryMonitor


def main():
    print("\n" + "="*70)
    print("  EPIC 1 DEMONSTRATION: Drone on a Leash")
    print("  Ground Station: Ubuntu 22.04 + Olympe SDK")
    print("="*70 + "\n")
    
    print("Step 1: Initialize Ground Station Components")
    registry = DroneRegistry()
    battery_monitor = BatteryMonitor()
    input("Press Enter to continue...")
    
    print("\nStep 2: Register Drone (M-US1.1)")
    drone = registry.register_drone(
        drone_id="DRONE-001",
        name="EcoDrone Alpha",
        ip_address="192.168.42.1",
        battery_capacity=4900,
        min_battery_level=20
    )
    input("Press Enter to continue...")
    
    print("\nStep 3: Battery Safety Check (M-US1.3)")
    is_safe, message = battery_monitor.check_battery_safety(drone)
    input("Press Enter to continue...")
    
    print("\nStep 4: Flight Command Interface (M-US1.2)")
    controller = DroneController(drone)
    print("\nAvailable commands:")
    print("  - takeoff(altitude)")
    print("  - land()")
    print("  - fly_to_coordinates(lat, lon, alt)")
    print("\n⚠️  Physical drone connection required for actual flight")
    
    if input("\nAttempt connection to drone? (y/n): ").lower() == 'y':
        if controller.connect():
            print("\n✅ Connected successfully!")
            
            if input("Perform test flight? (y/n): ").lower() == 'y':
                if controller.takeoff(10):
                    print("Hovering...")
                    import time
                    time.sleep(3)
                    controller.land()
            
            controller.disconnect()
        else:
            print("\n⚠️  No physical drone available - this is normal")
    
    print("\nStep 5: View Battery Logs")
    battery_monitor.print_battery_history(drone.drone_id)
    
    print("\n" + "="*70)
    print("  EPIC 1 COMPLETE!")
    print("  ✓ M-US1.1: Drone Registration")
    print("  ✓ M-US1.2: Basic Flight Commands")
    print("  ✓ M-US1.3: Battery Monitoring & Safety")
    print("="*70 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted")
