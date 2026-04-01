#!/usr/bin/env python3
import requests
import json
import time
import sys

API_BASE = "http://localhost:5001/api"

def print_response(response, action):
    try:
        data = response.json()
        if data.get("success"):
            print(f"✅ {action} Successful: {data.get('message', '')}")
            if data.get('data'):
                print(f"Data: {json.dumps(data.get('data'), indent=2)}")
        else:
            print(f"❌ {action} Failed: {data.get('message', '')}")
    except Exception as e:
        print(f"❌ Error parsing response for {action}: {e}")
        print(response.text)

def main():
    print("====================================")
    print(" EcoDrone API - Full Feature Client")
    print("====================================")
    
    # Check health and Olympe status
    try:
        resp = requests.get(f"{API_BASE}/health", timeout=3)
        health = resp.json()
        print(f"API Health: {health.get('status')}")
        print(f"Olympe SDK Available: {health.get('olympe')}")
        if not health.get('olympe'):
            print("⚠️ WARNING: Olympe SDK is NOT available. API is running in SIMULATION mode.")
            print("To test the physical drone, you must run the API server in an environment where 'olympe' is installed.")
    except Exception as e:
        print("❌ Could not connect to API server at http://localhost:5001. Is it running?")
        sys.exit(1)

    while True:
        print("\nCommands:")
        print(" 1 - Connect Drone")
        print(" 2 - Takeoff")
        print(" 3 - Land")
        print(" 4 - Move (fwd, right, up, rotation)")
        print(" 5 - Goto GPS (lat, lon, alt)")
        print(" 6 - Start Delivery Mission (Full Implementation)")
        print(" 7 - Survey Location (High Precision Campus Mapping)")
        print(" 8 - Drone Status/Telemetry")
        print(" 9 - List Delivery Locations")
        print(" 10 - U-Shape Delivery to Location")
        print(" q - Quit")
        
        cmd = input("\nSelect command: ").strip()

        if cmd == 'q':
            break
        elif cmd == '1':
            print("Connecting...")
            r = requests.post(f"{API_BASE}/connect")
            print_response(r, "Connect")
        elif cmd == '2':
            r = requests.post(f"{API_BASE}/takeoff")
            print_response(r, "Takeoff")
        elif cmd == '3':
            r = requests.post(f"{API_BASE}/land")
            print_response(r, "Land")
        elif cmd == '4':
            fwd = float(input("Forward (m): ") or 0)
            right = float(input("Right (m): ") or 0)
            up = float(input("Up (m): ") or 0)
            rot = float(input("Rotation (deg): ") or 0)
            r = requests.post(f"{API_BASE}/move", json={"forward": fwd, "right": right, "up": up, "rotation": rot})
            print_response(r, "Move")
        elif cmd == '5':
            lat = float(input("Latitude: "))
            lon = float(input("Longitude: "))
            alt = float(input("Altitude (m): ") or 10)
            r = requests.post(f"{API_BASE}/navigate", json={"latitude": lat, "longitude": lon, "altitude": alt})
            print_response(r, "Navigate")
        elif cmd == '6':
            print("Entering waypoints for delivery mission.")
            print("Hit enter on an empty line to finish.")
            waypoints = []
            i = 1
            while True:
                line = input(f"Waypoint {i} (lat,lon) [or empty]: ").strip()
                if not line:
                    break
                try:
                    lat, lon = map(float, line.split(','))
                    waypoints.append([lat, lon])
                    i += 1
                except:
                    print("Invalid format. Use lat,lon")
            if waypoints:
                print("Starting delivery. This runs the high-precision calibration logic.")
                r = requests.post(f"{API_BASE}/delivery/start", json={"waypoints": waypoints})
                print_response(r, "Delivery Mission")
            else:
                print("Operation cancelled.")
        elif cmd == '7':
            print("Initiating High-Precision Campus Mapping...")
            print("The drone will attempt to lock onto a stable GPS signal and average samples for 10 seconds.")
            print("This may take a minute or two depending on sky visibility.")
            r = requests.post(f"{API_BASE}/survey")
            print_response(r, "Survey")
            
            # Print specifically the surveyed data if successful
            if r.status_code == 200 and r.json().get("success"):
                data = r.json().get("data", {})
                print("\n📍 --- SURVEYED LOCATION DATA ---")
                print(f"Latitude:   {data.get('latitude')}")
                print(f"Longitude:  {data.get('longitude')}")
                print(f"Altitude:   {data.get('altitude')} m")
                print(f"Satellites: {data.get('satellites')} locked")
                print("--------------------------------")
                
        elif cmd == '8':
            r = requests.get(f"{API_BASE}/status")
            print_response(r, "Status")
        elif cmd == '9':
            r = requests.get(f"{API_BASE}/locations")
            if r.status_code == 200 and r.json().get("success"):
                locations = r.json().get("data", {}).get("locations", [])
                print("\n📍 --- DELIVERY LOCATIONS ---")
                for loc in locations:
                    print(f"{loc['name']:<30} | {loc['latitude']:<12.6f} | {loc['longitude']:<12.6f} | Alt: {loc['absolute_altitude']:.2f}m")
                print("----------------------------")
            else:
                print_response(r, "Locations")
        elif cmd == '10':
            r = requests.get(f"{API_BASE}/locations")
            if r.status_code == 200 and r.json().get("success"):
                locations = r.json().get("data", {}).get("locations", [])
                print("\n📍 --- SELECT DELIVERY TARGET ---")
                for idx, loc in enumerate(locations):
                    print(f" {idx + 1} - {loc['name']} (Alt: {loc['absolute_altitude']:.1f}m)")
                print(" 0 - Cancel")
                try:
                    choice = int(input("\nSelect location number: "))
                    if 1 <= choice <= len(locations):
                        selected = locations[choice - 1]
                        print(f"Initiating U-Shape delivery to {selected['name']}...")
                        r2 = requests.post(f"{API_BASE}/delivery/ushape", json={"location_name": selected["name"]})
                        print_response(r2, "U-Shape Delivery")
                    else:
                        print("Operation cancelled.")
                except ValueError:
                    print("Invalid input.")
            else:
                print("Failed to fetch delivery locations from API.")

if __name__ == "__main__":
    main()
