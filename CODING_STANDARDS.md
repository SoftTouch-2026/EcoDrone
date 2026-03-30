# Backend Coding Standards & Architecture

## Overview

This document outlines the architectural patterns, coding standards, and best practices for the backend API. It is intended to guide orchestration agents and developers in maintaining consistency when building new APIs.

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Documentation**: Swagger / OpenAPI (via `swagger-jsdoc`)
- **Authentication**: JWT

## Architecture

The application follows a classic **Layered Architecture**:
`Routes` -> `Controllers` -> `Services` -> `Data Access (Prisma)`

### 1. Routes (`src/routes/*.ts`)

- **Responsibility**: Define API endpoints, apply middleware (authentication, validation), and layout the HTTP interface.
- **Naming Convention**: `[resource].ts` (e.g., `users.ts`, `products.ts`).
- **Pattern**:
    - Export a function (e.g., `resourceRoutes`) that returns an Express `Router`.
    - Use `openapi` comments to define Swagger documentation for each endpoint.
    - Apply `requireUser` middleware for protected routes.
    - Apply `validateResource(Schema)` middleware for input validation.
- **Example**:
    ```typescript
    router.post('/createResource', [
        requireUser,
        validateResource(CreateResourceSchema),
        handleCreateResourceRequest,
    ])
    ```

### 2. Controllers (`src/controllers/*.controllers.ts`)

- **Responsibility**: Handle HTTP request/response cycle. Extract data from `req`, call services, and format `res`.
- **Naming Convention**: `[resource].controllers.ts`.
- **Pattern**:
    - Export individual functions (e.g., `handleCreateResourceRequest`).
    - Use `async/await`.
    - Wrap logic in `try/catch`.
    - On success: `res.status(2xx).json(data)`.
    - On error: `res.status(500).send(e)` or `res.status(400).send(e)`.
    - Use strict TypeScript types for `Request`: `Request<Params, ResBody, ReqBody>`.
    - **Do not** contain business logic or direct DB calls.

### 3. Services (`src/services/*.service.ts`)

- **Responsibility**: Implement business logic and interact with the database.
- **Naming Convention**: `[resource].service.ts`.
- **Pattern**:
    - Export individual functions (e.g., `createResourceService`).
    - Use `prisma` client for database operations.
    - Throw errors using `throw e` or `new Error('message')` to be caught by controllers.
    - Return plain data objects.

### 4. Schemas & Validation (`src/schemas/*.schemas.ts`)

- **Responsibility**: Define validation rules using Zod.
- **Naming Convention**: `[resource].schemas.ts`.
- **Pattern**:
    - Define `Payload` objects separating `body`, `params`, and `query`.
    - Export Zod schemas (e.g., `CreateResourceSchema`).
    - Validation is enforced via `validateResource` middleware.

### 5. Types (`src/utils/types.ts`)

- **Responsibility**: Centralize TypeScript type definitions, mostly inferred from Zod schemas.
- **Pattern**:
    - Import Schemas.
    - Export types using `TypeOf<typeof Schema>` (e.g., `export type CreateResourceInput = TypeOf<typeof CreateResourceSchema>`).

## Coding Conventions

### Naming

- **Files**: camelCase (e.g., `users.ts`, `users.controllers.ts`).
- **Functions**: camelCase (e.g., `createResourceService`).
- **Variables**: camelCase.
- **Types/Interfaces/Schemas**: PascalCase (e.g., `CreateResourceSchema`, `CreateResourceInput`).

### Error Handling

- **Services**: Throw errors.
- **Controllers**: Catch errors and send appropriate HTTP status codes (400, 500, etc.).
- **Validation**: Middleware catches Zod errors and returns standardized 400 Bad Request responses.

### Database

- Use `prisma.[model].[action]` patterns.
- Use `dbgenerated("uuid_generate_v4()")` for IDs in Prisma schema (if using UUIDs).
- Use `@db.Timestamptz(6)` for datetime fields (PostgreSQL specific).

## Workflow for Adding a New Resource

1.  **Database**: Update `prisma/schema.prisma` and run migration/push.
2.  **Schemas**: Create `src/schemas/[resource].schemas.ts` and define Zod schemas.
3.  **Types**: Add inferred types to `src/utils/types.ts`.
4.  **Service**: Create `src/services/[resource].service.ts` with business logic.
5.  **Controller**: Create `src/controllers/[resource].controllers.ts` to handle requests.
6.  **Route**: Create `src/routes/[resource].ts` with OpenAPI docs and middleware.
7.  **Register**: Add the new router to `src/routes/routes.ts` by importing the route function and adding `app.use('/path', resourceRoutes())`.
