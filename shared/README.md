# EcoDrone Shared Contracts

Shared API contracts, data models, and constants used by both the **Cloud Backend (delivery-app)** and **Ground Station (ground-station)**.

## Purpose

This package ensures that:
- Both systems use the **same data structures** for communication
- API changes are tracked in **one place**
- Type safety is enforced through **Pydantic models**
- Communication bugs are caught **at development time**

## Installation

### Development Mode (Recommended)

Install in editable mode so changes are immediately reflected:

```bash
cd shared
pip install -e .
```

This installs the package as `ecodrone-shared` in your Python environment.

### In Both Projects

Install in both `delivery-app` and `ground-station`:

```bash
# In delivery-app/backend/
pip install -e ../../shared

# In ground-station/
pip install -e ../shared
```

## Usage

### Importing Contracts

```python
# Import mission contracts
from ecodrone_shared.api_contracts import (
    MissionIntent,
    MissionStatus,
    GPSCoordinate,
    MissionState
)

# Import telemetry contracts
from ecodrone_shared.api_contracts import (
    TelemetryUpdate,
    DroneHealth,
    DroneRegistry
)

# Import commands
from ecodrone_shared.api_contracts import (
    MissionCommand,
    CommandType,
    CommandResponse
)

# Import constants
from ecodrone_shared.constants import (
    MIN_BATTERY_LEVEL,
    MAX_ALTITUDE_METERS,
    GEOFENCE_BOUNDS
)
```

## Package Structure

```
shared/
├── api_contracts/           # Pydantic data models
│   ├── mission.py          # Mission data structures
│   ├── telemetry.py        # Telemetry formats
│   ├── command.py          # Command messages
│   └── responses.py        # Standard API responses
├── constants/              # Shared constants
│   └── limits.py           # Safety limits, geofencing
└── setup.py                # Package configuration
```

## Key Contracts

### Mission Flow

1. **Backend creates mission**: `MissionIntent`
2. **Ground Station acknowledges**: `MissionAcknowledgment`
3. **Ground Station sends updates**: `MissionStatus`
4. **Backend can send commands**: `MissionCommand`

### Telemetry Flow

- **Real-time updates**: `TelemetryUpdate` (every 2-5 seconds)
- **Health checks**: `DroneHealth`

## Example: Cloud Backend

```python
from ecodrone_shared.api_contracts import MissionIntent, GPSCoordinate

# Create a mission
mission = MissionIntent(
    mission_id="M-001",
    drone_id="D-ANAFI-001",
    pickup_location=GPSCoordinate(latitude=5.7596, longitude=-0.2234),
    delivery_location=GPSCoordinate(latitude=5.7610, longitude=-0.2250),
    payload_weight_grams=350,
    priority=3
)

# Send to ground station
response = requests.post(
    "http://ground-station:8080/missions",
    json=mission.model_dump()  # Pydantic v2 syntax
)
```

## Example: Ground Station

```python
from fastapi import FastAPI
from ecodrone_shared.api_contracts import MissionIntent, MissionAcknowledgment

app = FastAPI()

@app.post("/missions")
async def receive_mission(mission: MissionIntent):
    # Pydantic automatically validates the incoming data
    print(f"Received mission {mission.mission_id}")
    print(f"Destination: {mission.delivery_location.latitude}, {mission.delivery_location.longitude}")
    
    # Return acknowledgment
    return MissionAcknowledgment(
        mission_id=mission.mission_id,
        acknowledged=True,
        ground_station_id="GS-001"
    )
```

## Updating Contracts

### Breaking Changes
When making breaking changes (renaming fields, changing types):
1. Update the contract in `shared/`
2. Update both `delivery-app` and `ground-station` code
3. Test both systems together
4. Version bump (e.g., 0.1.0 → 0.2.0)

### Non-Breaking Changes
Safe to add:
- New optional fields with defaults
- New enum values
- New endpoints

## Dependencies

- `pydantic>=2.0.0` - Data validation and serialization

## Version

Current version: **0.1.0**
