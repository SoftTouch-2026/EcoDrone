# EcoDrone Cloud Backend - Missing Features & Integration Gaps

This document outlines the architectural and functional features currently missing from the **Cloud Backend** (`delivery-app/backend`) that are required for a production-ready, safe, and integrated drone delivery system.

---

## 1. Authentication & Machine-to-Machine (M2M) Identity

The current backend implementation relies on `requireUser` middleware, which is primarily designed for human-tier authentication.

*   **[MISSING] Ground Station Registration**: No endpoint exists for a Ground Station (GS) to securely register its hardware ID (GS-001, etc.) and receive a persistent machine-tier API token.
*   **[MISSING] Handshake Protocol**: The GS requires a simplified "login" or "secret key" exchange to refresh its tokens without requiring human interaction via username/password.
*   **[MISSING] Scoped Permissions**: Commands to drones (Takeoff/Land) should require a specific "operator" role or machine-scoped permission that is currently not defined in the Prisma schema.

---

## 2. Real-time Communication Implementation

The current communication between the GS and the Cloud is primarily **REST-driven** (HTTP POST/GET), which introduces latency.

*   **[MISSING] Telemetry Fan-out (WebSocket)**: The backend receives telemetry via `POST /telemetry`, but it lacks a WebSocket server to broadcast this data live to frontend clients (Mobile App, Map Dashboards).
*   **[MISSING] Command Push (WebSocket)**: Currently, the GS **polls** for new commands. For safety-critical functions (Emergency Land, Abort Mission), the cloud should **push** the command immediately via a persistent WebSocket connection to eliminate polling delay.
*   **[MISSING] Connection Heartbeats**: No robust logic to detect when a Ground Station has lost internet connectivity (Ghost Proxy detection).

---

## 3. Mission & Path Management (MAVLink Support)

The current system handles single GPS commands but lacks full mission orchestration.

*   **[MISSING] Bulk Waypoint Upload**: The core `/commands` endpoint only handles an "origin-destination" pair. Real missions require multiple intermediary waypoints to avoid obstacles and follow safe flight corridors (e.g., M-US1.4 style).
*   **[MISSING] MAVLink Synchronization**: No endpoint to upload/download a standard `.plan` or MAVLink file to the GS for execution.
*   **[MISSING] Destination Validation**: Backend should pre-validate destination GPS coordinates against a **Static Geo-database** (No-Fly Zones) before even presenting them to the GS.

---

## 4. Safety & Environmental Parameter Sync

The Ground Station currently manages safety rules (Battery threshold, Geofence) locally.

*   **[MISSING] Parameter Sync Engine**: No `GET /config/sync` endpoint for the GS to pull global flight rules. For example, if Ashesi University changes its max altitude rule from 50m to 30m, it should be changed in the cloud and synced automatically to all Ground Stations.
*   **[MISSING] Pre-Flight Safety Gate**: An endpoint like `GET /safety/check` for the GS to query the cloud's regional weather (Wind speed, Precipitation) before allowing a Takeoff.

---

## 5. Diagnostics & Audit Logs

*   **[MISSING] Black-box Log Upload**: Parrot drones generate detailed `.pcap` and flight logs. The backend lacks a `POST /logs/upload` endpoint for the GS to send these for post-mission troubleshooting.
*   **[MISSING] Telemetry Persistence Policy**: Currently, telemetry is likely only stored as the "latest" value. High-resolution time-series data for the entire flight is not recorded for audit purposes.

---

## 6. Remote Site Survey Integration

*   **[MISSING] Survey Repository**: The GS has high-precision survey logic (`/api/survey`). The results of these precise surveys (verified latitude/longitude/altitude) should be uploaded to the cloud and stored in a **Site Profile** to improve landing accuracy for future missions to the same location.

---

## 7. Video Stream Orchestration (Optional)

*   **[MISSING] Stream Proxying**: ANAFI Ai supports RTSP/SRT streaming. The cloud backend is missing an orchestration layer to map the GS's local video feed to a URL accessible by the customer's mobile app (e.g., via a TURN/STUN server or HLS proxy).
