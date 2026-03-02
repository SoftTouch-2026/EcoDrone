import os
import requests
import argparse

import olympe
from olympe.messages.common.Mavlink import Start


olympe.log.update_config({"loggers": {"olympe": {"level": "INFO"}}})

DRONE_IP = "10.202.0.1"

headers = {
    "Accept": "application/json, text/javascript, text/plain */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest",
    "Content-type": "application/json; charset=UTF-8; application/gzip",
}

def parse_args():
    parser = argparse.ArgumentParser(description="Upload and start AirSDK flightmission with mavlink file")

    parser.add_argument(
        "filepath", type=str, help="Usage: python3 upload_mavlink.py </path/to/file/>")
    parser.add_argument(
        "--ip", type=str, help="Drone ip address", default=DRONE_IP)

    return parser.parse_args()
    
def main(filepath, drone_ip):
    drone = olympe.Drone(drone_ip)
    drone.connect()

    # Upload mavlink file
    with open(filepath, "rb") as data:
        resp = requests.put(
            url=os.path.join("http://", drone_ip, "api/v1/upload", "flightplan"),
            headers=headers,
            data=data,
        )
    
    # Start flightplan
    try:
        drone(
            Start(resp.json(), type="flightPlan")
        ).wait(_timeout=200)
    except:
        print("Error could not start flightplan")

    drone.disconnect()


if __name__ == "__main__":
    args = parse_args()
    main(args.filepath, args.ip)
