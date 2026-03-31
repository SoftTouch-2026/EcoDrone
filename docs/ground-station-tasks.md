# Ground Station & Frontend Implementation Tasks

*Prepared for the Ground Station / UI Developer*

This document outlines the tasks required on the **Ground Station** (Python/FastAPI) and **Operator Interface** (Tauri/React) side to achieve the MVP delivery flow. Your primary goal is to bridge the gap between the drone hardware (via Olympe) and the Cloud Backend.

---

## 1. Build the Cloud Client (`src/cloud_client.py`)

Currently, the ground station operates in a silo. You need to build a client that continuously talks to the Cloud Backend.

*   **Authentication:** The backend developer will provide a way for the ground station to authenticate (either a service API key or a specific JWT). Your client must store and use this token for all requests.
*   **Polling Loop:** Run a background asynchronous loop that polls `GET /ground-station/commands/pending/:drone_id` every few seconds to check for new flight commands dispatched by the cloud.
*   **Acknowledge Commands:** When the ground station accepts a command or finishes a mission, call `POST /ground-station/commands/acknowledge` to update the cloud's state (`accepted`, `in_progress`, `completed`).
*   **Push Telemetry:** Modify your existing telemetry loop to push data (battery, lat, lng, altitude, speed) via `POST /ground-station/telemetry` so the backend always has the latest state.

## 2. Implement Remote Abort Handling

The cloud backend will soon support remotely aborting a flight.
*   During your polling loop, if the cloud indicates that the current command has been `cancelled` (or if your telemetry POST returns a specific signal), you must safely trigger your existing `trigger_manual_override()` function to halt the drone and initiate a Return-to-Home (RTH).

## 3. Wire Up the Tauri Operator Interface

The React frontend currently uses simulated data. It needs to reflect reality.
*   **Real Telemetry:** Remove the `Math.random()` coordinate generation. Instead, have the UI fetch real telemetry (either by polling your local FastAPI backend or connecting to the cloud backend's new WebSocket server).
*   **True "Execute Flight":** Currently, the "EXECUTE FLIGHT" button directly hits the local FastAPI (`http://localhost:5001/api/delivery/start`). 
    *   *Change this:* The button should instead dispatch a trip/order via the **Cloud Backend**. The Cloud Backend will then generate the flight command, which your `cloud_client.py` (from Task 1) will pick up and execute locally.

## 4. Handle Mocking / Simulation

Ensure that your `SIMULATION` mode in the ground station remains robust. Since you'll be testing cloud integration heavily, you want to be able to accept real cloud commands and send back simulated telemetry without needing to physically fly the ANAFI Ai drone every time.
