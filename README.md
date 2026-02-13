# Eco-Drone API

A comprehensive RESTful API for an eco-friendly drone delivery service built with Node.js, TypeScript, Express, and PostgreSQL.

## Features

- **44 API Endpoints** across 9 resource groups
- **JWT Authentication** with access and refresh tokens
- **OpenAPI/Swagger Documentation** for interactive API exploration
- **Type-Safe** architecture with TypeScript and Zod validation
- **Docker Support** for easy deployment
- **PostgreSQL Database** with Prisma ORM
- **E-Commerce Flow** supporting menu browsing, cart management, and order processing

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Database Management](#database-management)
- [Docker Deployment](#docker-deployment)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** (v10 or higher)
- **PostgreSQL** (v16 or higher) - _Optional if using Docker_
- **Docker Desktop** - _Optional, for containerized deployment_

## Quick Start

### Option 1: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/SoftTouch-2026/Eco-drone-api.git
cd Eco-drone-api

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Generate Prisma Client
npx prisma generate

# 5. Run database migrations (if you have migrations)
npx prisma migrate deploy

# 6. Start the development server
npm run dev
```

The API will be available at `http://localhost:3000`  
Swagger documentation at `http://localhost:3000/api-docs`

### Option 2: Docker Deployment

```bash
# 1. Clone the repository
git clone https://github.com/SoftTouch-2026/Eco-drone-api.git
cd Eco-drone-api

# 2. Set up environment variables
cp .env.example .env
# Edit .env if needed (Docker uses service name 'postgres' as host)

# 3. Start services with Docker Compose
docker-compose up -d

# 4. View logs
docker-compose logs -f api
```

The API will be available at `http://localhost:3000`  
PostgreSQL will be available at `localhost:5432`

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Application
PORT=3000
NODE_ENV=development

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_DB=eco-drone-db

# Database URL
# For local development:
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/eco-drone-db?schema=public"

# For Docker:
# DATABASE_URL="postgresql://postgres:your_password_here@postgres:5432/eco-drone-db?schema=public"

# JWT Configuration
JWT_KEY="your_jwt_secret_key_here"
REFRESH_JWT_KEY="your_refresh_jwt_secret_key_here"
```

> **Important**: Never commit your `.env` file to version control. Use `.env.example` as a template.

## Running the Application

### Development Mode

```bash
npm run dev
```

Runs the app with nodemon for hot-reloading on file changes.

### Production Mode

```bash
# Build the TypeScript code
npm run build

# Start the production server
npm start
```

### Export Swagger Specification

```bash
npm run export-swagger
```

Exports the OpenAPI specification to `swagger/swagger.json`.

## API Documentation

Once the server is running, visit:

**Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

The Swagger UI provides:

- Interactive API exploration
- Request/response examples
- Authentication testing
- Schema definitions

## Project Structure

```
Eco-drone-api/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes with OpenAPI specs
│   ├── schemas/          # Zod validation schemas
│   ├── middlewares/      # Express middlewares
│   ├── utils/            # Utility functions and types
│   ├── scripts/          # Helper scripts
│   └── index.ts          # Application entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── dist/                 # Compiled JavaScript (generated)
├── docker-compose.yml    # Docker services configuration
├── Dockerfile            # Docker image definition
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Available Scripts

| Command                  | Description                              |
| ------------------------ | ---------------------------------------- |
| `npm run dev`            | Start development server with hot-reload |
| `npm run build`          | Compile TypeScript to JavaScript         |
| `npm start`              | Run production server                    |
| `npm run export-swagger` | Export OpenAPI specification             |

## Database Management

### Using Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio (Database GUI)
npx prisma studio

# Pull database schema
npx prisma db pull

# Push schema changes
npx prisma db push
```

### Direct PostgreSQL Access

```bash
# Connect to PostgreSQL (local)
psql -U postgres -d eco-drone-db

# Connect to PostgreSQL (Docker)
docker-compose exec postgres psql -U postgres -d eco-drone-db
```

## Docker Deployment

### Docker Commands

```bash
# Start services
docker-compose up -d

# Start with rebuild
docker-compose up --build -d

# View logs
docker-compose logs -f api
docker-compose logs -f postgres

# Check service status
docker-compose ps

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v

# Restart a specific service
docker-compose restart api
```

### Docker Services

- **postgres**: PostgreSQL 16 database (port 5432)
- **api**: Node.js API server (port 3000)

Both services include health checks and automatic restart policies.

## API Endpoints

### Authentication (4 endpoints)

- `POST /auth/signUp` - Register new user
- `POST /auth/signIn` - User login
- `PUT /auth/editUser` - Update user profile
- `DELETE /auth/deleteUser` - Delete user account

### Drones (6 endpoints)

- `POST /drones/createDrone` - Create drone
- `PUT /drones/updateDrone` - Update drone
- `DELETE /drones/deleteDrone/:id` - Delete drone
- `GET /drones/getDrone/:id` - Get drone details
- `GET /drones/getDrones/:page/:limit` - List drones
- `POST /drones/assignDrone` - Assign drone to order

### Locations (5 endpoints)

- `POST /locations/createLocation` - Create location
- `PUT /locations/updateLocation` - Update location
- `DELETE /locations/deleteLocation/:id` - Delete location
- `GET /locations/getLocation/:id` - Get location
- `GET /locations/getLocations/:page/:limit` - List locations

### Orders (5 endpoints)

- `POST /orders/createOrder` - Create order
- `PUT /orders/updateOrder` - Update order
- `DELETE /orders/deleteOrder/:id` - Delete order
- `GET /orders/getOrder/:id` - Get order
- `GET /orders/getOrders/:page/:limit` - List orders

### Trips (7 endpoints)

- `POST /trips/createTrip` - Create trip
- `PUT /trips/updateTrip` - Update trip
- `DELETE /trips/deleteTrip/:id` - Delete trip
- `GET /trips/getTrip/:id` - Get trip
- `GET /trips/getTrips/:page/:limit` - List trips
- `POST /trips/startTrip` - Start trip
- `POST /trips/endTrip` - End trip

### Menu (5 endpoints)

- `POST /menu/createMenu` - Create menu item
- `POST /menu/updateMenu` - Update menu item
- `DELETE /menu/deleteMenu` - Delete menu item
- `GET /menu/getMenu` - Get menu item
- `GET /menu/getMenus` - List menu items

### Cart (4 endpoints)

- `POST /cart/createCart` - Create cart
- `DELETE /cart/deleteCart` - Delete cart
- `GET /cart/getCart` - Get cart by ID
- `GET /cart/getCartByUser` - Get cart by user

### Cart Items (4 endpoints)

- `POST /cartItem/addCartItem` - Add item to cart
- `POST /cartItem/updateCartItem` - Update cart item
- `DELETE /cartItem/deleteCartItem` - Remove cart item
- `GET /cartItem/getCartItems` - List cart items

### Order Items (4 endpoints)

- `POST /orderItem/createOrderItem` - Add item to order
- `POST /orderItem/updateOrderItem` - Update order item
- `DELETE /orderItem/deleteOrderItem` - Remove order item
- `GET /orderItem/getOrderItems` - List order items

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests (when available): `npm test`
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Create a Pull Request

## Additional Documentation

- [DOCKER.md](./DOCKER.md) - Detailed Docker setup and troubleshooting
- [Swagger UI](http://localhost:3000/api-docs) - Interactive API documentation

## Troubleshooting

### Common Issues

**Port already in use**

```bash
# Find and kill process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Database connection failed**

- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- For Docker, ensure service name is `postgres` not `localhost`

**Prisma Client not generated**

```bash
npx prisma generate
```

**Docker build fails**

```bash
# Clean Docker cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## License

ISC

## Team

**Author**: Kwame Adaboh  
**Organization**: SoftTouch-2026

---

For questions or support, please open an issue on GitHub.
