# EcoDrone
A sustainable drone-powered delivery system

## Overview
This project implements an autonomous drone-based delivery system using the Parrot ANAFI Ai drone. The system architecture includes a Progressive Web App (PWA), cloud backend, Raspberry Pi drone control layer, and the ANAFI Ai drone running the Air SDK.

## Epic 1 Demonstration: Interactive Drone Control

The core deliverable for Epic 1 is the interactive `demo_epic1.py` script. This script provides a command-line interface (CLI) for controlling the drone, monitoring battery health, and managing unique drone identities.

### Features
- **Interactive CLI**: Control flight, navigation, and status in real-time.
- **Robust Identification**: Uses internal serial number for persistent drone tracking.
- **Battery Monitoring**: Live battery updates and safety checks.
- **Registry System**: Tracks known drones in `data/drones.json`.

### Running the Demo

1. **Activate Olympe Environment**:
   ```bash
   source ~/code/parrot-olympe/shell
   ```
2. **Run the Script**:
   ```bash
   python3 demo_epic1.py
   ```

### Interactive Commands

Once connected, use the following commands at the prompt:

| Command | Description | Example |
|---------|-------------|---------|
| `takeoff [alt]` | Take off to specific altitude (default: 10m) | `takeoff 15` |
| `land` | Land the drone | `land` |
| `move <fwd> <right> <up> [rot]` | Move relative (meters) with optional rotation (degrees) | `move 5 0 2 90` |
| `goto <lat> <lon> [alt]` | Fly to specific GPS coordinates | `goto 48.86 2.35 20` |
| `battery` | Show current battery level | `battery` |
| `status` | Show comprehensive drone status & ID | `status` |
| `list` | List all registered drones | `list` |
| `reset` | Clear the drone registry (fixes "ghost drone" issues) | `reset` |
| `quit` | Land and disconnect | `quit` |

> [!TIP]
> Use `reset` if you see duplicate or old drone entries in the registry.

---

## Basic Connectivity Test: hello.py

The `hello.py` script demonstrates basic drone control by executing a simple takeoff and landing sequence using the Parrot Olympe SDK.

### What the Script Does
- Connects to the ANAFI Ai drone
- Commands the drone to take off
- Hovers for 10 seconds
- Commands the drone to land
- Disconnects from the drone

### Prerequisites

#### System Requirements
- **Operating System**: Linux-based system (Ubuntu/Debian recommended)
- **Python**: Python 3.x
- **Drone**: Parrot ANAFI Ai drone
- **Network**: Connection to the drone (WiFi or ethernet)

#### System Dependencies
Install required system packages (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
    libncurses5-dev libncursesw5-dev xz-utils tk-dev \
    libffi-dev liblzma-dev python3-openssl git
```

### Installation Steps

#### 1. Set Up Olympe SDK

Clone and build the Olympe SDK:
```bash
# Navigate to your development directory
cd ~/code

# Clone the Olympe repository (if not already done)
git clone https://github.com/Parrot-Developers/olympe.git parrot-olympe

# Navigate to the Olympe workspace
cd parrot-olympe

# Run the post-installation script to install dependencies
./products/olympe/linux/env/postinst

# Build Olympe
./build.sh -p olympe-linux -t build -j
```

#### 2. Activate the Olympe Environment

Olympe provides a Python virtual environment with all necessary dependencies:

```bash
# For interactive use (spawns a new shell with olympe-python3 prompt)
source ~/code/parrot-olympe/shell

# Alternatively, for non-interactive/CI use (sets environment in current shell)
source ~/code/parrot-olympe/setenv
```

Your shell prompt should now show `(olympe-python3)` indicating the environment is active.

#### 3. Verify Olympe Installation

```bash
# Test that olympe can be imported
python -c "import olympe; print('Olympe installed successfully')"
```

### Running the hello.py Script

#### 1. Connect to Your Drone

Ensure your computer is connected to the ANAFI Ai drone's network:
- **WiFi**: Connect to the drone's WiFi hotspot (default IP: `192.168.42.1`)
- **USB/Ethernet**: Connect via USB-C or ethernet (default IP: `10.202.0.1`)

#### 2. Set the Drone IP (Optional)

The script uses `10.202.0.1` by default (USB/ethernet connection). To use a different IP:

```bash
export DRONE_IP="192.168.42.1"  # For WiFi connection
```

#### 3. Navigate to the Project Directory

```bash
cd /path/to/EcoDrone
```

#### 4. Run the Script

With the Olympe environment activated:

```bash
python hello.py
```

#### 5. Expected Output

You should see:
- Connection confirmation
- Takeoff command execution
- 10-second hover period
- Landing command execution
- Disconnection confirmation

### Troubleshooting

#### Connection Issues
- Verify the drone is powered on
- Check network connectivity: `ping $DRONE_IP`
- Ensure you're using the correct IP address for your connection type
- Verify firewall settings allow communication with the drone

#### Olympe Import Errors
- Ensure the Olympe virtual environment is activated
- Rebuild Olympe if necessary: `./build.sh -p olympe-linux -t build -j`
- Check that all system dependencies are installed

#### Script Execution Errors
- Ensure the drone is on a flat, stable surface
- Check that the drone battery is sufficiently charged
- Verify there are no obstacles around the drone
- Ensure the drone has GPS lock (if required by your model)

### Safety Notes

> [!CAUTION]
> - Always ensure adequate clearance around the drone before running any flight script
> - Test in a safe, open area away from people, animals, and obstacles
> - Keep the manual override controller ready to regain control if needed
> - Follow all local regulations regarding drone operation

### Exiting the Olympe Environment

When finished, exit the virtual environment:
```bash
exit  # or Ctrl+D
```

## Project Documentation

For more detailed information about the EcoDrone system architecture and design:
- [Design Document](docs/Design%20Document.md) - Complete system architecture specification
- [System Architecture](docs/system_architecture.md) - Detailed architecture diagrams
- [Project Description](docs/Project%20Descpriton.md) - Project overview and goals
- [ANAFI Ai Product Sheet](docs/ANAFI-Ai-product-sheet.pdf) - Drone specifications
- [ANAFI Ai Whitepaper](docs/whitepaperanafiai.pdf) - Technical whitepaper

## Technology Stack

- **Drone Control**: Python 3 + Parrot Olympe SDK
- **Backend**: FastAPI + PostgreSQL + Redis
- **Frontend**: React + TypeScript PWA
- **Drone Hardware**: Parrot ANAFI Ai with Air SDK

## License

See project documentation for licensing information.
