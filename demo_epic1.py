#!/usr/bin/env python3
"""
Epic 1 Demonstration Script
Demonstrates M-US1.1, M-US1.2, M-US1.3 with interactive flight control
"""

import sys
import os
import logging

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from registry.drone_registry import DroneRegistry
from drone_control.drone_controller import DroneController
from monitoring.battery_monitor import BatteryMonitor

# Suppress verbose Olympe telemetry logs (must be after imports)
logging.getLogger("olympe").setLevel(logging.ERROR)
logging.getLogger("ulog").setLevel(logging.ERROR)


def print_menu():
    """Print available commands"""
    print("\n" + "-"*50)
    print("COMMANDS:")
    print("  takeoff [alt]     - Take off to altitude (default: 10m)")
    print("  land              - Land the drone")
    print("  goto <lat> <lon> [alt] - Fly to GPS coordinates")
    print("  move <fwd> <right> <up> [rot] - Move relative (meters, deg)")
    print("  battery           - Check battery level")
    print("  status            - Show drone status")
    print("  quit              - Land and disconnect")
    print("-"*50)


def get_drone_serial(olympe_drone):
    """
    Get unique drone identifier using multiple fallback methods.
    Prioritizes persistent IDs (connection_state, device_name) over transient BootId.
    """
    # Method 1: Connection State (Best source for real serial)
    try:
        from olympe.messages.drone_manager import connection_state
        state = olympe_drone.get_state(connection_state)
        if "serial" in state:
            return state["serial"]
    except Exception:
        pass

    # Method 2: Internal device name (e.g. "ANAFI Ai 004668")
    try:
        if hasattr(olympe_drone, "_device_name") and olympe_drone._device_name:
            # Extract the hex/number part
            name = olympe_drone._device_name
            return name.replace(" ", "_").replace("-", "_")
    except Exception:
        pass

    # Method 3: BootId (Unique for session, but transient)
    try:
        from olympe.messages.common.CommonState import BootId
        boot_id = olympe_drone.get_state(BootId)["bootId"]
        return f"BOOT-{boot_id}"
    except Exception:
        pass

    # Method 4: IP Address (Last resort)
    try:
        return f"IP-{olympe_drone.ip_addr.replace('.', '')}"
    except Exception:
        return "UNKNOWN"


def main():
    import olympe
    
    print("\n" + "="*60)
    print("  EPIC 1: Drone on a Leash")
    print("  Ground Station Controller")
    print("="*60)
    
    # Connect to drone first to get its unique serial
    DRONE_IP = os.environ.get("DRONE_IP", "192.168.42.1")
    print(f"\n🔗 Connecting to {DRONE_IP}...")
    
    olympe_drone = olympe.Drone(DRONE_IP)
    if not olympe_drone.connect():
        print("✗ Could not connect to drone")
        return
    
    # Get unique serial from drone
    serial = get_drone_serial(olympe_drone)
    if not serial:
        serial = "UNKNOWN"
    drone_id = f"DRONE-{serial}"
    print(f"✓ Connected! Serial: {serial}")
    
    # Get initial battery level
    try:
        from olympe.messages.common.CommonState import BatteryStateChanged
        initial_battery = olympe_drone.get_state(BatteryStateChanged)["percent"]
    except Exception:
        initial_battery = 0
    
    # Initialize registry and battery monitor
    registry = DroneRegistry()
    battery_monitor = BatteryMonitor()
    
    # Get or register drone using actual serial
    drone = registry.get_drone(drone_id)
    if not drone:
        drone = registry.register_drone(
            drone_id=drone_id,
            name=f"EcoDrone {serial[-6:]}",
            ip_address=DRONE_IP,
            battery_capacity=4900,
            min_battery_level=20
        )
        print(f"✓ Registered new drone: {drone.name}")
    else:
        print(f"✓ Found existing drone: {drone.name}")
    
    # Update drone with live battery data
    if initial_battery > 0:
        drone.current_battery_level = initial_battery
        registry.update_drone(drone)

    # Battery check
    is_safe, msg = battery_monitor.check_battery_safety(drone)
    if not is_safe:
        print("⚠ Battery too low for flight")
        olympe_drone.disconnect()
        return
    
    # Initialize controller with the connected olympe drone
    controller = DroneController(drone)
    controller.olympe_drone = olympe_drone
    controller.is_connected = True
    
    print("\n✅ Ready for flight commands!")
    print_menu()
    
    # Interactive command loop
    while True:
        try:
            cmd = input("\n> ").strip().lower()
            if not cmd:
                continue
            
            parts = cmd.split()
            action = parts[0]
            
            if action == "takeoff":
                alt = float(parts[1]) if len(parts) > 1 else 10
                controller.takeoff(alt)
            
            elif action == "land":
                controller.land()
            
            elif action == "goto":
                if len(parts) < 3:
                    print("Usage: goto <lat> <lon> [alt]")
                    continue
                lat = float(parts[1])
                lon = float(parts[2])
                alt = float(parts[3]) if len(parts) > 3 else 10
                controller.fly_to_coordinates(lat, lon, alt)
            
            elif action == "move":
                if len(parts) < 4:
                    print("Usage: move <forward> <right> <up> [rot_deg]")
                    continue
                fwd = float(parts[1])
                right = float(parts[2])
                up = float(parts[3])
                
                # Psid (heading rotation) in radians
                psi_deg = float(parts[4]) if len(parts) > 4 else 0.0
                psi_rad = psi_deg * 3.14159 / 180.0
                
                print(f"📍 Moving: forward={fwd}m, right={right}m, up={up}m, rot={psi_deg}°")
                if controller.olympe_drone and controller.is_connected:
                    from olympe.messages.ardrone3.Piloting import moveBy
                    controller.olympe_drone(moveBy(fwd, right, -up, psi_rad)).wait()
                    print("✓ Move complete")
            
            elif action == "battery":
                level = controller.get_battery_level()
                if level:
                    print(f"🔋 Battery: {level}%")
            
            elif action == "status":
                # Refresh battery before showing status
                if controller.is_connected:
                    controller.get_battery_level()
                
                print(f"Drone ID: {drone.drone_id}")
                print(f"Name: {drone.name}")
                print(f"Status: {drone.status}")
                print(f"Connected: {controller.is_connected}")
                print(f"Battery: {drone.current_battery_level}%")
                
            elif action == "list":
                print("\nRegistered Drones:")
                for d_id, d in registry.drones.items():
                    print(f" - {d.name} ({d_id}) | Batt: {d.current_battery_level}% | Status: {d.status}")
            
            elif action == "reset":
                confirm = input("Are you sure you want to clear the registry? (y/n): ").lower()
                if confirm == 'y':
                    if os.path.exists(registry.registry_file):
                        os.remove(registry.registry_file)
                        registry.drones = {}
                        print("✓ Registry cleared. Please restart the script.")
                        break
                    else:
                        print("Registry file not found.")

            elif action in ("quit", "exit", "q"):
                print("\n🛬 Shutting down...")
                if drone.status == "in_flight":
                    controller.land()
                controller.disconnect()
                break
            
            elif action == "help":
                print_menu()
            
            else:
                print(f"Unknown command: {action}. Type 'help' for commands.")
                
        except ValueError as e:
            print(f"Invalid input: {e}")
        except Exception as e:
            print(f"Error: {e}")
    
    print("\n" + "="*60)
    print("  Session ended. Goodbye!")
    print("="*60 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted - landing and disconnecting...")
