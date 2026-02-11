# Ground Station - Drone Flight System

The **Ground Station** is the operational executor and safety-aware supervisor for EcoDrone missions. It runs on an **Ubuntu laptop/desktop** at the launch site and communicates with both the cloud backend and the ANAFI Ai drone.

## Role in System Architecture

```
[Cloud Backend] ←→ [Ground Station] ←→ [ANAFI Ai Drone]
   (delivery-app)   (THIS COMPONENT)    (Air SDK)
```

The ground station:
- ✅ Fetches mission assignments from the cloud backend
- ✅ Compiles missions into drone-executable waypoints
- ✅ Uploads missions to the drone's Air SDK
- ✅ Monitors telemetry and safety signals
- ✅ Streams telemetry back to cloud (when connected)
- ✅ Buffers data during network outages

> [!IMPORTANT]
> **Critical Rule**: The ground station supervises but does NOT control motor-level flight. The drone's Air SDK has full autonomy.

## Prerequisites

- **OS**: Ubuntu 22.04 (for Olympe SDK compatibility)
- **Python**: 3.8+
- **Hardware**: USB/WiFi connection to ANAFI Ai drone
- **Olympe SDK**: Installed and configured

## Folder Structure

```
ground-station/
├── controllers/          # Drone interfacing layer
│   └── drone_controller.py
├── api/                  # HTTP API for backend communication
│   └── ground_station_api.py
├── data/                 # Local drone registry, mission buffer
├── scripts/              # Development/test scripts
│   ├── sprint0.py
│   └── sprint1.py
├── operator-interface.html  # Web-based operator UI
├── tests/                # Unit and integration tests
└── requirements.txt      # Python dependencies
```

## Installation

### 1. Install Olympe SDK

Follow Parrot's official guide or use the existing olympe-venv.

### 2. Install Dependencies

```bash
cd ground-station
pip install -r requirements.txt
```

### 3. Install Shared Contracts

```bash
pip install -e ../shared
```

## Usage

### Running the Ground Station API

```bash
cd ground-station/api
python ground_station_api.py
```

This starts the HTTP server that listens for mission assignments from the cloud backend.

### Running Development Scripts

```bash
# Sprint 0: Basic takeoff/land
cd ground-station/scripts
python sprint0.py

# Sprint 1: Interactive CLI
python sprint1.py
```

### Opening the Operator Interface

The operator interface is a standalone HTML file that runs entirely in the browser — no build step required.

```bash
# Open directly in your browser
open ground-station/operator-interface.html
```

**Design**: SpaceX-inspired monochrome aesthetic with sharp corners, all-caps labels, and horizontal data separators. Built with React 18 + Tailwind CSS (CDN).

**Features**:
- Mission approval workflow (approve/reject incoming delivery requests)
- Real-time safety checklist with ✓ PASS / ✗ FAIL indicators
- Drone telemetry display (battery, GPS, signal, status)
- Activity log with color-coded success/error entries
- Mission queue management
- Statistics dashboard

## Key Components

### `controllers/drone_controller.py`
- Olympe SDK wrapper
- Mission compilation logic
- Telemetry streaming
- Safety checks

### `api/ground_station_api.py`
- HTTP endpoints for backend communication
- Mission receipt and acknowledgment
- Command handling (abort, pause, resume)
- Telemetry upload

### `data/`
- Local drone registry (`drones.json`)
- Mission buffer for offline operation
- Telemetry cache

## Communication Protocols

### With Cloud Backend
- **Protocol**: HTTPS + WebSocket
- **Endpoints**:
  - `POST /missions` - Receive mission
  - `GET /missions/{id}` - Get mission status
  - `POST /commands` - Receive commands
  - `WebSocket /telemetry` - Stream telemetry

### With Drone
- **Protocol**: Olympe SDK (TCP)
- **Operations**:
  - Mission upload
  - Start/stop/pause
  - Telemetry subscription
  - Emergency commands

## Safety Features

- **Battery Monitoring**: Won't start mission if battery < 20%
- **Geofence Enforcement**: Validates mission waypoints
- **Offline Resilience**: Buffers data during connectivity loss
- **Command Validation**: Verifies all commands before execution

## Development

### Running Tests

```bash
cd ground-station
pytest tests/
```

### Environment Variables

```bash
# Drone connection
DRONE_IP=10.202.0.1  # Change for WiFi: 192.168.42.1

# Backend connection
BACKEND_URL=https://api.ecodrone.example.com
GROUND_STATION_ID=GS-001
```

## License

Educational project for Ashesi University.
