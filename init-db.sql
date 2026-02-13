-- Initialize PostgreSQL database with required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE "eco-drone-db" TO postgres;
