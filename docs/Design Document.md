# Final Architecture Design Specification

## ANAFI Ai–Based Food Delivery System

---

## 1. Purpose and Scope

This document specifies the end-to-end technical architecture for a food delivery system using Parrot ANAFI Ai drones, a Raspberry Pi–based Drone Control layer, and a cloud backend, with a Progressive Web App (PWA) as the primary user interface.

The design is **production-oriented**, **safety-first**, and **regulator-aware**, explicitly separating:

- Business intent
- Real-time flight execution
- Onboard autonomous continuity

### Document Purpose

This specification is intended to be sufficiently detailed to guide:

- System implementation
- Safety reviews
- Regulatory discussions
- Team handoff

---

## 2. Architectural Principles (Non-Negotiable)

> [!IMPORTANT]
> **Critical Design Rules**
> 
> 1. No browser or cloud component directly controls motors or flight loops
> 2. The drone must be able to complete or abort a mission safely without network connectivity
> 3. There is exactly one authoritative mission state: onboard the drone
> 4. All offboard components are supervisors, not pilots
> 5. Safety logic always overrides business logic

---

## 3. High-Level System Architecture

```
[PWA]
   |
   | HTTPS / WebSocket
   v
[Backend (Mission Control)]
   |
   | HTTPS / WebSocket
   v
[Drone Control Service (Raspberry Pi)]
   |
   | Parrot SDK (TCP)
   v
[ANAFI Ai Drone]
   |
   | Air SDK (Onboard)
   v
[Flight Controller, Sensors, Actuators]
```

**Visual Diagram**: See [docs/system_architecture.md](docs/system_architecture.md) for detailed architecture diagram.


---

## 4. Component-Level Specification

### 4.1 Progressive Web App (PWA)

**Primary Role**: Mission initiation, monitoring, and human interaction.

#### Technology Stack

- React + TypeScript
- PWA Service Workers
- IndexedDB (offline cache)
- Mapbox GL JS or OpenLayers

#### Responsibilities

- Order placement and status display
- Operator approval workflows
- Live telemetry visualization (read-only)
- Manual abort request (high-level)

#### Explicitly Out of Scope

- Direct drone communication
- Flight logic
- Safety enforcement

---

### 4.2 Backend (Mission Control)

**Primary Role**: System of record and mission authorization authority.

#### Technology Stack

- Python (FastAPI)
- PostgreSQL + PostGIS
- Redis (state cache)
- WebSocket server

#### Responsibilities

- Order management
- Mission authorization and assignment
- Constraint validation (payload, distance, zones)
- Telemetry ingestion (non-authoritative)
- Audit logging and analytics

> [!WARNING]
> **Key Rule**: The backend never communicates directly with the drone.

---

### 4.3 Drone Control Service (Raspberry Pi)

**Primary Role**: Operational executor and safety-aware supervisor for a single drone.

#### Hardware

- Raspberry Pi 4 or newer
- Ubuntu Server or Raspberry Pi OS (64-bit)
- Reliable power and networking

#### Technology Stack

- Python 3
- Parrot Olympe SDK
- Local SQLite / filesystem buffering

#### Responsibilities

- Authenticate with backend
- Fetch and acknowledge missions
- Compile missions into onboard-executable form
- Upload missions to the drone (Air SDK)
- Start, pause, or abort missions
- Monitor telemetry and safety signals
- Buffer telemetry during outages

#### Explicitly Out of Scope

- Motor control
- Low-level navigation
- Autonomous decision-making under isolation

---

### 4.4 ANAFI Ai Drone (Air SDK)

**Primary Role**: Authoritative executor of flight missions and failsafe autonomy.

#### Technology

- Parrot Air SDK (onboard Linux)
- Access to sensors, navigation stack, obstacle avoidance

#### Responsibilities

- Execute uploaded mission plan
- Maintain mission state
- Perform obstacle avoidance
- Enforce geofencing and altitude limits
- Execute failsafes (RTL, land, loiter)
- Continue mission during loss of connectivity

> [!CAUTION]
> **Authority Rule**: Air SDK safety logic overrides all external commands.

---

## 5. Mission Lifecycle (Procedural)

### Step 1: Order Creation
- Customer places order via PWA
- Backend validates feasibility

### Step 2: Mission Authorization
- Backend assigns mission to a specific drone
- Mission intent is made available to Drone Control

### Step 3: Mission Fetch and Compilation
- Raspberry Pi pulls mission intent
- Validates local drone readiness
- Compiles a self-contained mission

### Step 4: Mission Upload (Critical Step)
- Mission is uploaded once to the drone via Air SDK
- Mission becomes authoritative onboard

### Step 5: Mission Execution
- Drone Control initiates mission
- Drone executes autonomously
- Telemetry streamed when available

### Step 6: Connectivity Loss (If Occurs)
- Drone continues mission onboard
- Raspberry Pi and backend buffer state

### Step 7: Mission Completion
- Drone completes delivery and return
- Drone Control reconciles state
- Backend finalizes order

---

## 6. Communication Interfaces

### 6.1 Backend ↔ Drone Control

#### Protocols
- HTTPS (REST)
- WebSocket (telemetry, heartbeats)

#### Data Types
- Mission intent
- Mission state transitions
- Telemetry summaries
- Abort / pause commands

---

### 6.2 Drone Control ↔ Drone

#### Protocol
- Parrot SDK TCP connection

#### Data Types
- Mission upload
- Mission start/stop
- Telemetry (GPS, battery, state)
- Heartbeats

---

## 7. Failure Handling and Authority Matrix

| Scenario | Outcome |
|----------|----------|
| Backend offline | Drone Control continues mission |
| Drone Control offline | Air SDK completes or aborts mission |
| Network loss mid-flight | Air SDK continues autonomously |
| Safety violation | Air SDK overrides all commands |


---

## 8. Security Model

- Per-drone credentials
- Mutual authentication (Backend ↔ Drone Control)
- Signed mission payloads
- Immutable flight logs

---

## 9. Regulatory Alignment

- Clear separation of responsibilities
- Deterministic failure behavior
- Auditability of decisions
- Human override capability without direct piloting

---

## 10. Key Design Invariants (Checklist)

- [ ] Drone can finish or abort mission without network
- [ ] Backend never sends motor-level commands
- [ ] Mission state exists only onboard
- [ ] Safety logic cannot be overridden remotely
- [ ] Logs are recoverable after outages

---

## 11. Final One-Line Summary

> [!NOTE]
> **Design Philosophy**
> 
> The backend decides what should happen, the Raspberry Pi supervises how it is initiated, and the drone decides how it survives and completes the mission.

---

**End of Specification**