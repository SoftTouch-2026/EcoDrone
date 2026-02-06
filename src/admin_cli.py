#!/usr/bin/env python3
"""
EcoDrone Ground Station - Simple Admin Interface
Basic CLI for Epic 1 demonstration
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from registry.drone_registry import DroneRegistry
from drone_control.drone_controller import DroneController
from monitoring.battery_monitor import BatteryMonitor


def main():
    print("\n" + "="*70)
    print("  ECODRONE GROUND STATION - Admin Interface")
    print("  Platform: Ubuntu 22.04 + Olympe SDK")
    print("="*70 + "\n")
    
    registry = DroneRegistry()
    battery_monitor = BatteryMonitor()
    
    while True:
        print("\n1. Register Drone")
        print("2. List Drones")
        print("3. Flight Operations")
        print("4. Battery History")
        print("0. Exit")
        
        choice = input("\nChoice: ").strip()
        
        if choice == "1":
            drone_id = input("Drone ID: ").strip()
            name = input("Name: ").strip()
            ip = input("IP (default 192.168.42.1): ").strip() or "192.168.42.1"
            registry.register_drone(drone_id, name, ip)
        
        elif choice == "2":
            registry.list_drones()
        
        elif choice == "3":
            drones = registry.get_all_drones()
            if not drones:
                print("No drones registered")
                continue
            
            for i, d in enumerate(drones, 1):
                print(f"{i}. {d.drone_id} - {d.name}")
            
            try:
                idx = int(input("Select drone: ")) - 1
                drone = drones[idx]
                
                # Check battery first
                is_safe, msg = battery_monitor.check_battery_safety(drone)
                
                controller = DroneController(drone)
                print("\na. Connect")
                print("b. Takeoff")
                print("c. Land")
                print("d. Disconnect")
                
                subchoice = input("Action: ").strip().lower()
                if subchoice == 'a':
                    controller.connect()
                elif subchoice == 'b':
                    controller.takeoff()
                elif subchoice == 'c':
                    controller.land()
                elif subchoice == 'd':
                    controller.disconnect()
                
                # Save drone state
                registry.update_drone(drone)
            except:
                print("Invalid selection")
        
        elif choice == "4":
            battery_monitor.print_battery_history(limit=20)
        
        elif choice == "0":
            print("\nGoodbye!")
            break


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nExiting...")
