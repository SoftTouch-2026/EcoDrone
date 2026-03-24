# Eco-Drone API - Docker Setup

## Quick Start

### Prerequisites

- Docker Desktop installed
- Docker Compose installed

### Running with Docker Compose

1. **Start the application**:

    ```bash
    docker-compose up --build
    ```

2. **Start in detached mode** (background):

    ```bash
    docker-compose up -d
    ```

3. **View logs**:

    ```bash
    # All services
    docker-compose logs -f

    # API only
    docker-compose logs -f api

    # Database only
    docker-compose logs -f postgres
    ```

4. **Stop the application**:

    ```bash
    docker-compose down
    ```

5. **Stop and remove volumes** (clears database):
    ```bash
    docker-compose down -v
    ```

## Services

### API Server

- **URL**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api-docs
- **Container**: eco-drone-api

### PostgreSQL Database

- **Host**: localhost
- **Port**: 5432
- **Database**: eco-drone-db
- **Username**: postgres
- **Container**: eco-drone-postgres

## Environment Variables

Copy `.env.example` to `.env` and update values as needed:

```bash
cp .env.example .env
```

**Important**: The `DATABASE_URL` in `.env` should use `postgres` as the host (Docker service name) when running in Docker:

```
DATABASE_URL="postgresql://postgres:password@postgres:5432/eco-drone-db?schema=public"
```

For local development (non-Docker), use `localhost`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/eco-drone-db?schema=public"
```

## Database Migrations

Migrations run automatically when the API container starts. To run manually:

```bash
# Enter the API container
docker-compose exec api sh

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Development Workflow

### Rebuild after code changes:

```bash
docker-compose up --build
```

### Access database directly:

```bash
docker-compose exec postgres psql -U postgres -d eco-drone-db
```

### View database with Prisma Studio:

```bash
# From your local machine (not in Docker)
npx prisma studio
```

## Troubleshooting

### Port already in use

If port 3000 or 5432 is already in use, stop the conflicting service or change the port mapping in `docker-compose.yml`:

```yaml
ports:
    - '3001:3000' # Change host port to 3001
```

### Database connection issues

1. Check if postgres container is healthy:

    ```bash
    docker-compose ps
    ```

2. View postgres logs:

    ```bash
    docker-compose logs postgres
    ```

3. Verify DATABASE_URL uses `postgres` as host (not `localhost`)

### Reset database

```bash
docker-compose down -v
docker-compose up --build
```

## Production Deployment

For production, consider:

1. Using environment-specific `.env` files
2. Setting up proper secrets management
3. Using a managed PostgreSQL service
4. Implementing proper logging and monitoring
5. Setting up SSL/TLS certificates
6. Configuring reverse proxy (nginx/traefik)

## Health Checks

Both services have health checks configured:

- **Postgres**: Checks database readiness every 10s
- **API**: Checks Swagger endpoint every 30s

The API waits for postgres to be healthy before starting.
