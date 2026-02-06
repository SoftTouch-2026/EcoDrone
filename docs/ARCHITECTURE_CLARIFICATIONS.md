# EcoDrone EPIC 1: Corrected System Architecture

Corrected architecture clarifications based on discussion:

## Hardware Components

1. **Ground Station** (Ubuntu 22.04 Laptop/Desktop)
   - Runs Olympe SDK
   - Communicates with PWA via IPC
   - Sends flight commands to drone

2. **Drone** (ANAFI Ai)
   - Executes flight autonomously
   - Has onboard sensors: IMU, GPS, Camera
   - Does NOT have environmental sensors
   - Communication: WiFi (~300m) → SkyController (2-4km LOS) → LTE (campus-wide via SIM)

3. **Raspberry Pi 3** (Independent Sensor Module)
   - Completely separate from drone control
   - Carried as passive payload ("climate scientist passenger")
   - Has environmental sensors: Temperature, CO, CO₂
   - Transmits data independently to backend via WiFi/Cellular
   - No communication with drone systems

## Communication Flow

```
PWA → Backend → Ground Station (Olympe) → Drone (via WiFi/SkyController/LTE)
                     ↑
                     |
Raspberry Pi 3  ─────┘ (independent sensor data upload)
(carried by drone)
```

## For Epic 1 Implementation

Focus on:
- Ground station scripts (running Olympe)
- Drone registry and control
- Battery monitoring
- Basic flight commands from ground station to drone

The Raspberry Pi 3 sensor module is OUT OF SCOPE for Epic 1 - it will be addressed in Epic 5 (Sensor Data Integration).
