# EcoDrone High-Precision GPS Flight Implementation

This document outlines the high-precision GPS flight logic and offset-correction strategy for the Parrot ANAFI Ai drone, as implemented in the ground station utilizing the Olympe SDK. The core drone control logic resides in `ground-station/controllers/delivery_controller.py`.

## Overview 

The `DeliveryController` is designed to handle autonomous delivery missions with a specific focus on mitigating **GPS multipath interference**. Multipath interference occurs when GPS signals bounce off structures (buildings, trees), causing positional drift. The controller counteracts this by calibrating an initial "Logical Origin" and applying an inertial offset cancellation at the delivery destination.

## Control Phases

The controller operates across 3 sequential phases to ensure safe and accurate navigation:

### Phase A: Calibration & Initial Bias Recording
Before proceeding with the mission, the drone establishes a reliable starting point and calculates environmental GPS bias.
1. **GNSS Stabilization**: The drone waits on the ground until it secures at least 14 satellites to ensure high accuracy.
2. **Logical Origin (LO) Recording**: It averages its GPS position (Latitude, Longitude) over a 10-second period (20 samples at 2Hz) to establish the Logical Origin.
3. **Calibration Hop & Bias Calculation**: 
   - The drone takes off to a height of 5 meters.
   - It is commanded to return to the exact LO coordinates at this altitude.
   - Any physical deviation from the exact takeoff spot while trying to hold the LO coordinate is identified as the **GPS Multipath Bias**.
   - The North and East offsets are calculated in meters and stored internally (`self.offset_north`, `self.offset_east`).

### Phase B: Global Transit
Navigates the drone from the starting location to the destination waypoints safely above ground obstacles.
- **Ascension**: The drone ascends to the designated `cruise_alt` (default 35m).
- **Waypoint Navigation**: Navigates sequentially through the provided list of GPS waypoints. At each step, it ensures the state stabilizes and the network link remains intact.

### Phase C: Arrival & Offset Cancellation
The final approach utilizes the bias recorded in Phase A to accurately deliver the package, mitigating destination-side multipath errors.
1. **EKF Stabilization**: The drone hovers for 10 seconds to allow its Extended Kalman Filter (EKF) and GNSS state to settle.
2. **Safety Check**: Ensures at least 8 satellites are visible before descending. If the count drops below 8 due to a partial block during descent, it waits up to 30s before aborting.
3. **Descent**: Descends to 5 meters. This lowers the drone beneath primary multipath structures (like a building canopy) into an area where optical flow/inertial sensors are more reliable than GPS.
4. **Inertial Offset Cancellation**: 
   - The controller applies the negated bias calculated in Phase A (`-self.offset_north`, `-self.offset_east`).
   - The drone physically translates this offset using its local inertial frame (`moveBy` command), canceling out the simulated drift caused by GPS multipath boundaries.
5. **Full Landing**: Executes the final landing sequence to finalize the delivery.

## Safety & Failsafes Setup

- **Heartbeat / Link Drops**: The controller continuously monitors the `LinkSignalQuality`. If the network drops below the minimum acceptable threshold for more than 5 seconds, an automatic **Return-to-Home (RTH)** sequence is triggered.
- **Manual Override**: A pilot can trigger `trigger_manual_override()` at any time, which halts the drone in place (hover mode) and aborts the autonomous mission.
- **State Check Wait**: A wrapper for Olympe commands that waits for the drone's `flying_state` to switch to "hovering" for at least 3 seconds, ensuring the completion of prior movement commands despite potential 4G network latency.
- **Simulation Mode**: If the SDK `olympe` cannot be imported, the controller correctly falls back to a mocked "SIMULATION" mode allowing for offline testing of the pipeline API without connection to the physical drone.

## Running on Another Machine
Since you are migrating to a computer with Olympe natively installed:
1. Ensure the drone is connected via Wi-Fi (`192.168.42.1`) or via 4G (by updating the `ip_address` or using Skycontroller).
2. Start the FastAPI backend and test the connection by instantiating the `DeliveryController()` class and calling its `connect()` function.
3. The complete delivery logic can be triggered by calling `execute_delivery(waypoints_list)`.
