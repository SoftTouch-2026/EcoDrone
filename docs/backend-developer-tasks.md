# Cloud Backend Developer Tasks

*Prepared for the Node.js/Express Backend Developer*

This document outlines the high-priority tasks required in `delivery-app/backend` to achieve the core MVP delivery flow for the EcoDrone platform. Your goal is to establish a robust path between a placed Order and the real-time execution of the physical drone.

---

## 1. Implement Ground Station Service Authentication

**Context:** The ground station (Python app running on a laptop) needs to poll your endpoints (`/ground-station/*`) programmatically without browser interaction.
*   **Action:** Create a mechanism for head-less authentication.
*   **Suggestion:** Either add `ground_station` to the `user_type` enum in Prisma and issue long-lived JWTs, or create a specific `POST /auth/serviceToken` route that exchanges a `.env` API key for a short-lived token.

## 2. Order-to-Flight Coordinates Translation

**Context:** Orders use UUIDs for `pickup_location` and `dropoff_location`. The actual drone's SDK (Olympe) requires absolute GPS Latitude and Longitude to navigate.
*   **Action:** When a trip is dispatched, you must resolve those Location UUIDs into their corresponding GPS coordinates.
*   **Action:** Create an endpoint (e.g., `POST /trips/dispatch/:trip_id`) that generates a `flight_commands` record. The `waypoints` JSON in that record must contain the resolved Lat/Lng payload for the drone to follow.

## 3. Link `flight_commands` to Logistics

**Context:** Currently, `flight_commands` is independent of `trips` or `orders`.
*   **Action:** Update `prisma/schema.prisma` to add `trip_id` and `order_id` as foreign keys to the `flight_commands` model.
*   **Action:** Ensure the dispatch endpoint from Task 2 populates these new fields.

## 4. Spin up Real-Time WebSocket Streaming

**Context:** Tracking the drone via HTTP GET polling is incredibly inefficient and will kill the server.
*   **Action:** Integrate `socket.io` or the native Node `ws` library into the Express server.
*   **Action:** When the ground station pushes new coordinates via `POST /ground-station/telemetry`, broadcast that payload out to all connected frondend clients listening on a channel like `drone-stream:{drone_id}`.

## 5. Wire Up Automatic State Synchronization

**Context:** Data islands exist. Drone battery and Order status are currently static.
*   **Action (`drones` sync):** In `reportTelemetryService` (`src/services/groundStation.service.ts`), add an `upsert` or `update` to automatically sync the latest `battery_level` and `status` (`in_flight`, `available`) to the core `drones` table.
*   **Action (`orders` sync):** In `startTripService` and `endTripService` (`src/services/trips.service.ts`), gracefully cascade the `trip.status` changes back up to the parent `orders.status` (e.g., automatically mark the parent order as `started` or `completed`).

## 6. Remote Flight Abort

**Context:** System Admins need a kill switch.
*   **Action:** Add a `POST /ground-station/commands/cancel/:command_id` endpoint.
*   **Action:** This route should force update the command's status to `cancelled`. The Ground Station's polling loop will pick this up and safely return the drone to home.
