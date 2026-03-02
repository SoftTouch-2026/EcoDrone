# FlightPlan Execution Guide (Parrot / Olympe)

## 1. Overview

In the Parrot ecosystem, a FlightPlan is a mission defined by a MAVLink `.mavlink` text file. To execute a mission on a drone using Olympe, you must follow a two-step process: Upload (via REST API) and Execute (via Olympe SDK).

---

## 2. Preparing the FlightPlan

Before uploading, ensure your `.mavlink` file meets the following criteria:

- **Header:** Must start with `QGC WPL 110` (or the version specified in your config).
- **Structure:** Tab-separated values with 12 columns per line.
- **Mandatory Items:** At least one `WAYPOINT` (Command 16) is required for GroundSDK to accept the mission.
- **Coordinates:** Navigation commands (except RTL and LAND) must have valid Latitude/Longitude.

---

## 3. Step 1 — Uploading via REST API

The drone hosts a web server that manages mission files. You must use a `PUT` request to send your file to the drone's internal storage.

### Endpoint Details

| Property | Value |
|----------|-------|
| **URL** | `http://192.168.42.1/api/v1/upload/flightplan` |
| **Method** | `PUT` |
| **Payload** | Raw binary content of the `.mavlink` file |

### Implementation (Python)

```python
import requests

def upload_flightplan(filepath: str) -> str:
    url = "http://192.168.42.1/api/v1/upload/flightplan"
    with open(filepath, "rb") as f:
        response = requests.put(url, data=f)
    response.raise_for_status()
    uid = response.json().get("uid")
    print(f"Upload successful. UID: {uid}")
    return uid
```

---

## 4. Step 2 — Starting the Mission via Olympe

Once you have the UID from Step 1, use Olympe to command the drone to execute it.

### Required Olympe Messages

- `olympe.messages.common.Mavlink.Start` — Begins the mission.
- `olympe.messages.common.Mavlink.MavlinkFilePlayingStateChanged` — Monitors if the mission is running.

### Implementation (Python)

```python
import olympe
from olympe.messages.common.Mavlink import Start, MavlinkFilePlayingStateChanged

DRONE_IP = "192.168.42.1"

def start_mission(uid: str):
    drone = olympe.Drone(DRONE_IP)
    drone.connect()

    drone(
        Start(filepath=uid, type="flightPlan")
        >> MavlinkFilePlayingStateChanged(state="playing", _timeout=10)
    ).wait().success()

    print("Mission started successfully.")
    drone.disconnect()
```

---

## 5. Critical Flight Safety Info

Several conditions must be met for the mission to start.

### Pre-flight Checklist

- Drone is armed and GPS lock is acquired.
- Sufficient battery level.
- Home position is set.
- `.mavlink` file has been successfully uploaded and UID confirmed.

### Safety Commands

Always have a script or physical controller ready to interrupt the mission:

```python
# Pause the mission
drone(olympe.messages.common.Mavlink.Pause()).wait()

# Stop and Return to Home
drone(olympe.messages.common.Mavlink.Stop()).wait()
```

### Disconnection Policy

If using Olympe, the drone may RTH if it loses Wi-Fi connection to your laptop. To prevent this, use `start_at_v2` with `continue_on_disconnect=1` — **only recommended for advanced users in open areas**.

---

## 6. Common Status Codes

If the REST API upload fails, refer to the following codes:

| Code | Meaning | Action |
|------|---------|--------|
| `200 OK` | Success | Proceed with the returned UID. |
| `415 Unsupported Media Type` | MAVLink file is corrupt or improperly formatted | Check your converter script. |
| `507 Insufficient Storage` | Too many flightplans stored on the drone | Use `DELETE /api/v1/upload/flightplan/{uid}` to clean up. |
