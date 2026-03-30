import os
import sys
import requests
import argparse

import olympe
from olympe.messages.common.Mavlink import Start
from olympe.messages.ardrone3.GPSSettingsState import GPSFixStateChanged
from olympe.messages.common.CommonState import BatteryStateChanged
from olympe.messages.common.FlightPlanState import AvailabilityStateChanged, ComponentStateListChanged
from olympe.messages.common.MavlinkState import MavlinkFilePlayingStateChanged


olympe.log.update_config({"loggers": {"olympe": {"level": "INFO"}}})

# --- IP Address Constants ---
# Use 192.168.42.1  for direct Wi-Fi connection to physical drone
# Use 192.168.53.1  for connection via SkyController 4
# Use 10.202.0.1    for Parrot Sphinx simulator only
DRONE_IP = "192.168.42.1"

# Minimum battery level required to start a mission (%)
MIN_BATTERY_LEVEL = 20

# Timeout (seconds) to wait for GPS fix before aborting
GPS_FIX_TIMEOUT = 30

headers = {
    "Accept": "application/json, text/javascript, text/plain */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest",
    "Content-type": "application/json; charset=UTF-8; application/gzip",
}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Upload and start an AirSDK flight mission with a mission (.txt) file"
    )
    parser.add_argument(
        "filepath", type=str, help="Usage: python3 upload.py </path/to/file.txt>"
    )
    parser.add_argument(
        "--ip", type=str, help="Drone IP address", default=DRONE_IP
    )
    return parser.parse_args()


def check_battery(drone) -> bool:
    """Check battery level is sufficient for flight. Returns True if safe."""
    print("🔋 Checking battery level...")
    try:
        battery_state = drone.get_state(BatteryStateChanged)
        level = battery_state["percent"]
        print(f"   Battery: {level}%")
        if level < MIN_BATTERY_LEVEL:
            print(f"✗ Battery too low ({level}%). Minimum required: {MIN_BATTERY_LEVEL}%.")
            return False
        print(f"✓ Battery OK ({level}%)")
        return True
    except Exception as e:
        print(f"⚠ Could not read battery level: {e}")
        # Ask operator to confirm if battery check fails
        confirm = input("   Battery check failed. Continue anyway? (y/n): ").strip().lower()
        return confirm == "y"


def wait_for_gps_fix(drone) -> bool:
    """Wait for a 3D GPS fix before proceeding. Returns True if fix acquired."""
    print(f"📡 Waiting for GPS fix (timeout: {GPS_FIX_TIMEOUT}s)...")
    try:
        result = drone(
            GPSFixStateChanged(fixed=1, _timeout=GPS_FIX_TIMEOUT, _policy="check_wait")
        ).wait()
        if result.success():
            print("✓ GPS fix acquired")
            return True
        else:
            print("✗ GPS fix timed out. Mission aborted.")
            return False
    except Exception as e:
        print(f"✗ GPS fix check failed: {e}")
        return False


def upload_flightplan(drone_ip, filepath):
    """Upload the MAVLink file to the drone via HTTP. Returns the drone-side filepath or None."""
    print(f"📤 Uploading flight plan: {filepath} ...")
    try:
        with open(filepath, "rb") as data:
            resp = requests.put(
                url=os.path.join("http://", drone_ip, "api/v1/upload", "flightplan"),
                headers=headers,
                data=data,
            )
        resp.raise_for_status()
        resp_data = resp.json()
        print(f"✓ Upload successful (HTTP {resp.status_code})")
        print(f"   Drone response: {resp_data}")
        return resp_data
    except FileNotFoundError:
        print(f"✗ File not found: {filepath}")
        return None
    except requests.HTTPError as e:
        print(f"✗ HTTP error during upload: {e}")
        return None
    except Exception as e:
        print(f"✗ Upload failed: {e}")
        return None


def main(filepath, drone_ip):
    print("\n" + "=" * 55)
    print("  EcoDrone - MAVLink Mission Uploader")
    print("=" * 55)
    print(f"  Target drone IP : {drone_ip}")
    print(f"  Mission file    : {filepath}")
    print("=" * 55 + "\n")

    # Step 1: Connect to drone
    print(f"🔗 Connecting to drone at {drone_ip}...")
    drone = olympe.Drone(drone_ip)
    if not drone.connect():
        print("✗ Could not connect to drone. Aborting.")
        sys.exit(1)
    print("✓ Connected\n")

    try:
        # Step 2: Battery check
        if not check_battery(drone):
            sys.exit(1)

        # Step 3: GPS fix check
        if not wait_for_gps_fix(drone):
            sys.exit(1)

        # Step 4: Upload flight plan
        upload_response = upload_flightplan(drone_ip, filepath)
        if upload_response is None:
            sys.exit(1)

        # The upload API returns a UID string that the Start command uses as the filepath
        flightplan_uid = str(upload_response)
        print(f"   Flight plan UID: {flightplan_uid}")

        # Step 5: Check FlightPlan availability before proceeding
        print("\n🔍 Checking flight plan availability...")
        try:
            avail = drone.get_state(AvailabilityStateChanged)
            if avail and avail.get("AvailabilityState", 0) == 1:
                print("✓ FlightPlan is available")
            else:
                print("⚠ FlightPlan is NOT available. Checking components...")
                try:
                    components = drone.get_state(ComponentStateListChanged)
                    component_names = {
                        "GPS": "GPS fix",
                        "Calibration": "Magnetometer calibration",
                        "Mavlink_File": "MAVLink file validity",
                        "TakeOff": "Take-off readiness",
                        "WaypointsBeyondGeofence": "Waypoints within geofence",
                        "CameraAvailable": "Camera availability",
                        "Mavlink_State": "MAVLink state",
                        "Mavlink_Media": "MAVLink media",
                        "FirstWaypointTooFar": "First waypoint reachable",
                    }
                    for comp_key, comp_label in component_names.items():
                        try:
                            state = components[comp_key]["State"]
                            status = "✓ OK" if state == 1 else "✗ NOT OK"
                            print(f"   {status} - {comp_label}")
                        except (KeyError, TypeError):
                            pass
                except Exception as e:
                    print(f"   Could not read component states: {e}")
                
                proceed = input("\n   FlightPlan not available. Try to start anyway? (y/n): ").strip().lower()
                if proceed != "y":
                    print("✗ Mission aborted.")
                    sys.exit(1)
        except Exception as e:
            print(f"   ⚠ Could not check availability: {e}")

        # Step 7: Manual confirmation before takeoff
        print("\n⚠️  READY TO START MISSION")
        print(f"   The drone at {drone_ip} will take off and execute the uploaded flight plan.")
        confirm = input("   Type 'yes' and press Enter to confirm, anything else to abort: ").strip().lower()
        if confirm != "yes":
            print("✗ Mission aborted by operator.")
            sys.exit(0)

        # Step 8: Start flight plan
        # Start() expects the UID string returned from the upload API
        print(f"\n🚁 Starting flight plan (UID: {flightplan_uid})...")
        try:
            result = drone(
                Start(flightplan_uid, type="flightPlan")
            ).wait(_timeout=200)

            if result.success():
                print("✓ Flight plan started successfully. Mission is running.")
            else:
                print("✗ Failed to start flight plan (command rejected by drone).")
                # Try to get the actual error state from the drone
                try:
                    mavlink_state = drone.get_state(MavlinkFilePlayingStateChanged)
                    print(f"  Drone mavlink state: {mavlink_state}")
                except Exception:
                    pass
                print("  Possible causes:")
                print("    - Drone is not calibrated (magnetometer)")
                print("    - Drone is not in outdoor mode")
                print("    - GPS fix was lost")
                print("    - MAVLink file contains errors")
                print("    - Waypoints are beyond the geofence")
                sys.exit(1)

        except Exception as e:
            print(f"✗ Error starting flight plan: {e}")
            sys.exit(1)

    finally:
        # Always disconnect cleanly
        drone.disconnect()
        print("\n🔌 Disconnected from drone.")


if __name__ == "__main__":
    args = parse_args()
    main(args.filepath, args.ip)
