# Delivery App - Campus Delivery System

The **Delivery App** is the cloud-hosted business layer of EcoDrone. It handles orders, mission planning, and user interactions through a Progressive Web App (PWA).

## Role in System Architecture

```
[PWA Frontend] ←→ [Backend API] ←→ [Ground Station]
  (THIS - React)   (THIS - FastAPI)   (ground-station)
```

The delivery app:
- ✅ Provides customer-facing ordering interface
- ✅ Manages delivery orders and routing
- ✅ Assigns missions to available drones
- ✅ Monitors real-time delivery status
- ✅ Stores historical data and analytics

> [!WARNING]
> **Critical Rule**: This component NEVER communicates directly with drones. All drone operations go through the ground station.

## Folder Structure

```
delivery-app/
├── backend/              # FastAPI cloud backend
│   ├── app/
│   │   ├── models/      # Database models
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── main.py      # Application entry
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/             # React PWA
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   └── App.tsx
│   ├── public/
│   │   └── manifest.json
│   └── package.json
└── docker-compose.yml    # Local development stack
```

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL + PostGIS (for geospatial queries)
- **Cache**: Redis
- **WebSocket**: For real-time updates
- **Queue**: Celery (for async tasks)

### Frontend
- **Framework**: React + TypeScript
- **PWA**: Service Workers, offline support
- **Maps**: Mapbox GL JS or OpenLayers
- **State Management**: React Query + Context API
- **UI Library**: Tailwind CSS

## Installation

### Backend Setup

```bash
cd delivery-app/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install shared contracts
pip install -e ../../shared

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd delivery-app/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Docker Compose (Recommended for Local Development)

```bash
cd delivery-app
docker-compose up
```

This starts:
- Backend API (port 8000)
- Frontend dev server (port 3000)
- PostgreSQL (port 5432)
- Redis (port 6379)

## Key Features

### Customer Features
- Browse menu / delivery options
- Place orders with delivery location
- Track delivery in real-time
- Order history

### Operator Features
- Mission dashboard
- Drone fleet status
- Manual mission assignment
- Abort/pause missions
- Analytics and reporting

### System Features
- Automated mission assignment
- Route optimization
- Geofence validation
- Battery-aware scheduling
- Weather integration (future)

## API Endpoints

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order status
- `GET /api/orders` - List orders (paginated)

### Missions
- `GET /api/missions` - List missions
- `POST /api/missions` - Create mission (internal)
- `GET /api/missions/{id}` - Get mission details
- `POST /api/missions/{id}/abort` - Abort mission

### Drones
- `GET /api/drones` - List available drones
- `GET /api/drones/{id}` - Get drone status
- `GET /api/drones/{id}/telemetry` - Real-time telemetry (WebSocket)

## Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/ecodrone
REDIS_URL=redis://localhost:6379
GROUND_STATION_URL=http://ground-station:8080
SECRET_KEY=your-secret-key

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_MAPBOX_TOKEN=your-mapbox-token
```

## Deployment

### Cloud Run (GCP)

```bash
# Build and deploy backend
gcloud run deploy ecodrone-backend \
  --source ./backend \
  --region africa-south1 \
  --allow-unauthenticated

# Build and deploy frontend
gcloud run deploy ecodrone-frontend \
  --source ./frontend \
  --region africa-south1 \
  --allow-unauthenticated
```

## Development

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head
```

## License

Educational project for Ashesi University.
