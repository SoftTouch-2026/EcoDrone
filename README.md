# EcoDrone - Sustainable Campus Delivery System

A production-ready, safety-first drone delivery system using the Parrot ANAFI Ai drone for campus deliveries at Ashesi University.

## 🎯 Project Overview

EcoDrone is a complete autonomous delivery system featuring:
- **Cloud-hosted web application** for order management
- **Ground station software** for drone control and supervision  
- **Safety-first architecture** with offline resilience
- **Regulatory-compliant** design with clear authority boundaries

## 🏗️ System Architecture

```
┌──────────────────┐       HTTPS        ┌──────────────────┐     Olympe SDK    ┌──────────────┐
│   Delivery App   │ ◄─────────────────► │  Ground Station  │ ◄───────────────► │  ANAFI Ai    │
│  (Cloud Hosted)  │                     │  (On-Premises)   │                   │    Drone     │
│                  │                     │                  │                   │              │
│  • PWA Frontend  │                     │  • Mission Exec  │                   │  • Air SDK   │
│  • Backend API   │                     │  • Safety Watch  │                   │  • Autonomy  │
│  • PostgreSQL    │                     │  • Telemetry     │                   │  • Sensors   │
└──────────────────┘                     └──────────────────┘                   └──────────────┘
         ↓                                        ↓
    shared/api_contracts/                  shared/api_contracts/
```

## 📁 Repository Structure

```
EcoDrone/
├── delivery-app/          # ☁️ Cloud-hosted business layer
│   ├── backend/           # FastAPI + PostgreSQL + Redis
│   └── frontend/          # React TypeScript PWA
│
├── ground-station/        # 🖥️ On-premises drone control
│   ├── controllers/       # Olympe SDK interfacing
│   ├── api/               # Ground station HTTP API
│   ├── data/              # Local drone registry & mission buffer
│   ├── scripts/           # Development & test scripts
│   └── operator-interface.html  # Web-based operator UI (SpaceX-inspired)
│
├── shared/                # 🔗 API contracts & constants
│   ├── api_contracts/     # Pydantic models (missions, telemetry, commands)
│   └── constants/         # Safety limits, geofencing, states
│
└── docs/                  # 📚 System documentation
    ├── Design Document.md
    ├── system_architecture.md
    └── Project Description.md
```

## 🚀 Quick Start

### 1. Install Shared Contracts

```bash
cd shared
pip install -e .
```

### 2. Set Up Ground Station (for drone control)

```bash
cd ground-station

# Install dependencies
pip install -r requirements.txt
pip install -e ../shared

# Run interactive demo (Epic 1)
python scripts/sprint1.py
```

### 3. Set Up Delivery App (cloud services)

```bash
cd delivery-app

# Backend
cd backend
pip install -r requirements.txt
pip install -e ../../shared
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## 📖 Component Documentation

Each component has detailed documentation:

- [**delivery-app/**](delivery-app/README.md) - Cloud backend + PWA frontend
- [**ground-station/**](ground-station/README.md) - Drone control & supervision
- [**shared/**](shared/README.md) - API contracts & constants

## 🔑 Key Design Principles

> [!IMPORTANT]
> **Critical Safety Rules**
> 
> 1. No cloud component directly controls drone motors
> 2. Drone can complete missions without network connectivity
> 3. Mission state exists only onboard the drone (authoritative)
> 4. All offboard systems are supervisors, not pilots
> 5. Safety logic always overrides business logic

## 🛠️ Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Delivery App Backend** | FastAPI, PostgreSQL, Redis, WebSocket |
| **Delivery App Frontend** | React, TypeScript, PWA, Mapbox/OpenLayers |
| **Ground Station** | Python 3, Parrot Olympe SDK, FastAPI |
| **Shared Contracts** | Pydantic (data validation & serialization) |
| **Drone** | ANAFI Ai with Air SDK (autonomous execution) |

## 📊 Current Status

### ✅ Completed (Epic 1)
- Interactive CLI for drone control
- Battery monitoring and safety checks
- Drone identification and registry system
- Basic flight commands (takeoff, land, move, goto)
- **Web-based Operator Interface** — SpaceX-inspired mission control UI
  - Mission approval workflow (approve/reject incoming missions)
  - Real-time safety checklist with pass/fail indicators
  - Drone telemetry display (battery, GPS, signal, status)
  - Activity log with color-coded entries
  - Mission queue management and statistics dashboard

### 🚧 In Progress
- Backend ↔ Ground Station API integration
- Mission compilation and upload

### 📋 Planned
- Autonomous waypoint navigation
- Order management system
- Real-time telemetry dashboard
- Delivery tracking for customers

## 🧪 Development

### Running Tests

```bash
# Ground station
cd ground-station
pytest tests/

# Delivery app backend
cd delivery-app/backend
pytest

# Delivery app frontend
cd delivery-app/frontend
npm test
```

### Environment Setup

See individual component READMEs for detailed setup instructions:
- [Ground Station Setup](ground-station/README.md#installation)
- [Delivery App Setup](delivery-app/README.md#installation)

## 📄 Documentation

- [Design Document](docs/Design%20Document.md) - Complete architecture specification
- [System Architecture](docs/system_architecture.md) - Detailed diagrams
- [Project Description](docs/Project%20Descpriton.md) - Project goals & context
- [Architecture Clarifications](docs/ARCHITECTURE_CLARIFICATIONS.md) - Hardware details

## 👥 Team

**Course**: ICS 532 - Agile Software Engineering Methods  
**Institution**: Ashesi University  
**Academic Year**: 2025-2026

## 📜 License

Educational project for Ashesi University.

---

## 🎯 Design Philosophy

> The **cloud backend** decides what should happen,  
> the **ground station** supervises how it is initiated,  
> and the **drone** decides how it survives and completes the mission.

This separation ensures safety, regulatory compliance, and autonomous resilience.
