# EcoDrone Hello World 🚁

## Sprint 0 Deliverable: Take-off & Land Control System

**Course:** ICS 532 - Agile Software Engineering Methods  
**University:** Ashesi University  
**Drone:** Parrot ANAFI Ai

---

## 📋 Overview

This is the "Hello World" deliverable for the EcoDrone project - a basic drone control system that allows you to:

- ✅ **Connect** to the Parrot ANAFI Ai drone
- ✅ **Launch** the drone to 10 meters altitude
- ✅ **Land** the drone safely
- ✅ **Monitor** battery level and altitude in real-time

### Architecture

```
┌─────────────────────┐     HTTP API      ┌─────────────────────┐     Olympe SDK     ┌─────────────────┐
│   React Frontend    │ ◄───────────────► │   Flask Backend     │ ◄────────────────► │  ANAFI Ai Drone │
│   (index.html)      │     Port 5000     │   (app.py)          │                    │                 │
│                     │                   │                     │                    │  WiFi Direct:   │
│ [🚀 LAUNCH] [🛬 LAND]│                   │  /api/connect       │                    │  192.168.42.1   │
│  Status Dashboard   │                   │  /api/takeoff       │                    │                 │
│  Battery & Altitude │                   │  /api/land          │                    │  Simulator:     │
└─────────────────────┘                   │  /api/status        │                    │  10.202.0.1     │
                                          └─────────────────────┘                    └─────────────────┘
```

---

## 🛠️ Prerequisites

### Hardware
- Parrot ANAFI Ai drone
- Parrot Skycontroller 4 (optional, for extended range)
- Computer with WiFi capability

### Software
- **Operating System:** Ubuntu 20.04+ or Linux (Olympe SDK requirement)
- **Python:** 3.8 or higher
- **Web Browser:** Chrome, Firefox, or Safari

---

## 📦 Installation

### Step 1: Clone/Download the Project

```bash
# If using git
git clone <your-repo-url>
cd ecodrone-hello-world

# Or extract the downloaded files
cd ecodrone-hello-world
```

### Step 2: Set Up Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Linux/Mac
# or
.\venv\Scripts\activate   # On Windows (limited functionality)

# Install dependencies
pip install -r backend/requirements.txt
```

### Step 3: Install Parrot Olympe SDK (Linux Only)

```bash
# Add Parrot repository
echo "deb https://parrot-sphinx.ams3.digitaloceanspaces.com/packages $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/parrot-sphinx.list
curl -fsSL https://parrot-sphinx.ams3.digitaloceanspaces.com/packages/gpg | sudo apt-key add -

# Update and install
sudo apt update
sudo apt install parrot-olympe

# Or install via pip
pip install parrot-olympe
```

**Note:** If you're not on Linux or can't install Olympe, the system will run in **Simulation Mode** automatically.

---

## 🚀 Running the System

### Option A: Full System (Backend + Frontend)

#### Terminal 1: Start the Backend API

```bash
cd backend
source ../venv/bin/activate  # If not already activated

# For simulation mode (no physical drone needed)
export DRONE_CONNECTION_MODE=simulation
python app.py

# For physical drone via WiFi
export DRONE_CONNECTION_MODE=wifi
python app.py

# For Sphinx simulator
export DRONE_CONNECTION_MODE=sphinx
python app.py
```

You should see:
```
============================================================
  EcoDrone API Server
  Parrot ANAFI Ai Drone Control
============================================================
  Olympe SDK Available: True/False
  Connection Mode: simulation/wifi/sphinx
  Controller: DroneSimulator/ParrotANAFIController
============================================================

  Starting server on http://localhost:5000
```

#### Terminal 2: Open the Frontend

```bash
# Option 1: Open directly in browser
# Simply open frontend/index.html in your web browser

# Option 2: Use Python's built-in server
cd frontend
python -m http.server 8080
# Then open http://localhost:8080 in your browser
```

### Option B: Connect to Physical Drone

1. **Power on your ANAFI Ai drone**

2. **Enable Direct WiFi Connection:**
   - Open FreeFlight 7 app on your phone
   - Go to Settings > Connectivity
   - Enable "Direct WiFi connection"

3. **Connect your computer to the drone's WiFi:**
   - Look for network: `ANAFI-XXXXXX`
   - Connect to it (default: no password, or check FreeFlight 7)

4. **Start the backend with WiFi mode:**
   ```bash
   export DRONE_CONNECTION_MODE=wifi
   python backend/app.py
   ```

5. **Open the frontend and click "Connect"**

---

## 🎮 Using the Interface

### Control Buttons

| Button | Function | When Available |
|--------|----------|----------------|
| 🔗 **Connect** | Connect to drone | When disconnected |
| ⛓️ **Disconnect** | Disconnect from drone | When connected |
| 🚀 **LAUNCH** | Take off to 10m | Connected, landed, battery ≥ 20% |
| 🛬 **LAND** | Land the drone | Connected and flying |

### Status Indicators

- **Battery Gauge:** Shows current battery level (green > 50%, yellow 20-50%, red < 20%)
- **Altitude Bar:** Shows current altitude (target line at 10m)
- **Status Badge:** Shows current drone state (DISCONNECTED, READY, TAKING OFF, HOVERING, LANDING, LANDED)

---

## 📡 API Reference

Base URL: `http://localhost:5000`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/api/status` | Get current drone status |
| POST | `/api/connect` | Connect to drone |
| POST | `/api/disconnect` | Disconnect from drone |
| POST | `/api/takeoff` | Take off to 10m |
| POST | `/api/land` | Land the drone |
| GET | `/api/health` | Health check |
| GET | `/api/info` | API and drone info |

### Example API Calls

```bash
# Get status
curl http://localhost:5000/api/status

# Connect to drone
curl -X POST http://localhost:5000/api/connect

# Take off
curl -X POST http://localhost:5000/api/takeoff

# Land
curl -X POST http://localhost:5000/api/land

# Disconnect
curl -X POST http://localhost:5000/api/disconnect
```

---

## 🧪 Testing Without a Drone

The system includes a built-in simulator that mimics drone behavior:

1. **Set simulation mode:**
   ```bash
   export DRONE_CONNECTION_MODE=simulation
   ```

2. **Run the backend:**
   ```bash
   python backend/app.py
   ```

3. **Open the frontend and test all buttons**

The simulator will:
- Simulate gradual altitude changes during takeoff/landing
- Simulate battery drain
- Respond to all commands with realistic delays

---

## 🔧 Troubleshooting

### "Connection to API failed"
- Ensure the backend is running on port 5000
- Check that no firewall is blocking the connection
- Try: `curl http://localhost:5000/api/health`

### "Olympe SDK not available"
- Olympe only works on Linux
- The system will automatically use simulation mode
- To install: `pip install parrot-olympe` (Linux only)

### "Cannot connect to drone"
- Ensure drone is powered on
- Check WiFi connection to drone's network
- Verify direct connection is enabled in FreeFlight 7
- Default drone IP: 192.168.42.1

### "Battery too low"
- Battery must be ≥ 20% to take off (safety feature)
- Charge the drone before flying

---

## 📁 Project Structure

```
ecodrone-hello-world/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── drone_controller.py    # Drone control logic (Olympe + Simulator)
│   └── requirements.txt       # Python dependencies
├── frontend/
│   └── index.html            # React-based control interface
└── README.md                 # This file
```

---

## 📋 User Stories Addressed

### M-US1.2: Basic Drone Commands
> "As a Drone, I can receive a basic 'take-off to 10m,' 'fly to GPS coordinates,' and 'land' command from the server, so core movement is automated."

✅ **Implemented:**
- Take-off to 10m altitude
- Land command

🔜 **Coming in Sprint 1:**
- Fly to GPS coordinates

### M-US1.3: Battery Monitoring
> "As an Administrative System, I can monitor and log each drone's battery level in real-time, so I can prevent flights when battery is below 20%."

✅ **Implemented:**
- Real-time battery level display
- Flight prevention when battery < 20%

---

## 👥 Team

**Course:** ICS 532 - Agile Software Engineering Methods  
**University:** Ashesi University  
**Sprint:** 0 - Inception & Foundation

---

## 📜 License

Educational project for Ashesi University.

---

## 🔗 Resources

- [Parrot Olympe Documentation](https://developer.parrot.com/docs/olympe/)
- [Parrot ANAFI Ai Specs](https://www.parrot.com/us/drones/anafi-ai)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
