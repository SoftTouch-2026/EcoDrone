# Cloud Backend vs Ground Station Gap Analysis — EcoDrone

> Generated: 2026-03-30 | Scope: `delivery-app/backend` vs `ground-station`

---

## MVP Vision & System Architecture (Reference)

```
[Customer App / Admin Dashboard]
           ↕ WebSockets (Missing) + HTTPS / JWT
  [Cloud Backend — Node.js/Express]     ← This is what we're auditing
           ↕ HTTPS polling + push
  [Ground Station — Python/FastAPI]     (port 5001, Ubuntu laptop on-site)
           ↕ Olympe SDK (TCP/WiFi)
      [ANAFI Ai Drone — Air SDK]
```

**MVP Delivery Flow:**
1. Customer places an order.
2. Cloud dispatches trip and issues a flight command (with precise GPS coordinates).
3. Ground Station executes flight using Olympe.
4. Ground Station streams real-time telemetry back.
5. Customer/Admin track the drone location live on a map.
6. Order ends automatically after dropoff.

The ground station is the **executor**, while the cloud backend is the **coordinator**.

---

## What Is Already Implemented ✅

| Area | Implemented endpoints |
|---|---|
| Auth | Sign-up, sign-in, edit/delete user, JWT + refresh tokens |
| Drones (CRUD) | Create, update, delete, get, list, assign-to-order |
| Locations | Full CRUD |
| Orders | Full CRUD + paginated list |
| Trips | Create, update, delete, get, list, start, end |
| Vendors & Menu | Full CRUD (from `ecodrone-api`) |
| Admin reports | Revenue, orders-by-status, drone utilization |
| Ground Station API | `POST /ground-station/commands`, `GET .../pending/:id`, `POST .../acknowledge`, `POST .../telemetry`, `GET .../latest/:id` |

---

## Gaps — Missing Features for MVP

---

### GAP 1 — Ground Station Has No Cloud Integration Code (Critical)

**Impact: 🔴 Critical — The entire command-dispatch loop is broken**

The cloud backend correctly defines all `/ground-station/*` endpoints, but `ground-station/api/app.py` **never calls them**. It only talks to the local drone.
- **Fix:** Needs a `cloud_client.py` module in the ground station to poll `GET /commands/pending/:id`, call `acknowledge`, and push `POST /telemetry`.

---

### GAP 2 — `flight_commands` Table Has No Link to `trips` or `orders` (Critical)

**Impact: 🔴 Critical — Commands and trips are disconnected data islands**

When an admin starts a trip, no flight command is issues for the drone. When a drone finishes a flight, the trip isn't updated.
- **Fix in schema.prisma:** Add `trip_id` and `order_id` as foreign keys to `flight_commands`.
- **Fix in backend:** Add `POST /trips/dispatch/:trip_id` to generate a command when a trip begins.

---

### GAP 3 — Missing Order-to-Flight Coordinates Translation (Critical)

**Impact: 🔴 Critical — Drones don't know where to fly**

Orders use `pickup_location` and `dropoff_location` UUIDs, but the drone (via Olympe) requires absolute GPS Latitude and Longitude to navigate.
- **Fix:** The dispatch endpoint (`POST /trips/dispatch/:trip_id`) must look up the Lat/Lng of the start and end locations and construct the `waypoints` JSON payload required by the `flight_commands` table.

---

### GAP 4 — No Real-Time WebSocket Streaming for Telemetry (Critical)

**Impact: 🔴 Critical — Live-tracking on apps is impossible without spamming the API**

Currently, the apps would have to spam `GET /ground-station/telemetry/latest/:id` every second to animate the drone.
- **Fix:** Add a WebSocket (`socket.io` or `ws`) server to the Express backend. When the ground station pushes telemetry, the backend must immediately broadcast it on a `drone-stream:{id}` channel so frontends can animate smoothly.

---

### GAP 5 — No Drone Battery / Status Sync from Telemetry (High)

**Impact: 🔴 High — Drone fleet status is always stale**

The telemetry endpoint fields data, but the core `drones` table never updates its `battery_level` or `status` (`available`, `pending`).
- **Fix:** `reportTelemetryService` must automatically `upsert` the latest `battery_level` and `status` (`in_flight`, `returning`) to the `drones` table.

---

### GAP 6 — No Order Status Cascade When Trip Starts/Ends (High)

**Impact: 🔴 High — Order status stays pending forever**

`trip.status` changes, but `orders.status` is never updated to `started` or `completed`.
- **Fix:** Update `startTripService` and `endTripService` to cascade status updates to the parent `orders` record.

---

### GAP 7 — No Abort / Remote Cancel Endpoint for In-Flight Commands (Medium)

**Impact: 🟡 Medium — Operators cannot remotely abort missions safely**

- **Fix:** Add `POST /ground-station/commands/cancel/:command_id` to set a command to `cancelled`. The ground station polling loop picks this up and triggers local RTH (Return to Home).

---

### GAP 8 — Operator Interface (Tauri App) Is Not Wired to Real Data (Medium)

**Impact: 🟡 Medium — Telemetry displayed on ground UI is simulated noise**

- **Fix:** The Tauri React app must poll the real local endpoints (or the cloud endpoints via WebSockets) instead of generating `Math.random()` telemetry.

---

### GAP 9 — No Ground Station Service Authentication (Medium)

**Impact: 🟡 Medium — Ground station machine cannot authenticate against the cloud API**

- **Fix:** Create a `ground_station` user type or a `POST /auth/serviceToken` endpoint using an API key from `.env`.

---

### GAP 10 — No Telemetry History Endpoint (Low-Medium)

**Impact: 🟢 Low — Post-flight analytics and replay are impossible**

- **Fix:** Add `GET /ground-station/telemetry/:drone_id` with `date_from`/`date_to` filters.

---

### GAP 11 — Environmental Data Is Fully Mocked (Low)

**Impact: 🟢 Low — Irrelevant for MVP logistics, but needed eventually**

- **Fix:** Add `environmental_readings` table and `POST /admin/environmental/readings` for the separate Pi sensor module.

---

### GAP 12 — `drones` Model Missing Operational Metadata (Low)

**Impact: 🟢 Low — Nice-to-have for fleet dispatch**

- **Fix:** Add `battery_capacity_mah`, `max_range_km`, `last_active_at`, and `total_flights` to `drones` table.

---

## Recommended Implementation Order (Path to MVP)

To achieve the MVP completely and efficiently, implement the gaps in this order:

**PHASE 1: Core Logistics Bridge**
1. **GAP 9:** Add Service Auth (Unblocks the ground station).
2. **GAP 2 & GAP 3:** Link commands to trips and translate location UUIDs to GPS Lat/Lng waypoints during dispatch.
3. **GAP 1:** Write `cloud_client.py` in the ground station so it can poll for these commands and execute them.

**PHASE 2: Real-Time State & Sync**
4. **GAP 4:** Spin up the WebSocket server on the Express backend and establish the telemetry broadcast room.
5. **GAP 5 & GAP 6:** Wire up the side-effects so posting telemetry updates the `drones` table, and completing trips updates the `orders` table.

**PHASE 3: Safety & UI Polish**
6. **GAP 7:** Implement the remote abort mechanism.
7. **GAP 8:** Wire the Tauri frontend to the real datastreams.
8. _(Post-MVP)_ Gaps 10, 11, and 12 (History, Environmental sensors, metadata).
