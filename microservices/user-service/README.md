# User Service

## Overview

User Service is a microservice responsible for user management within the Order Management System. It handles authentication, authorization and all user-related CRUD operations.

## Features

- User registration and authentication
- JWT-based authorization
- User profile management
- Role-based access control (admin/customer)
- User search and filtering

## Tech Stack

- Node.js & Express.js
- PostgreSQL (user_service_db schema)
- Sequelize ORM
- JWT for authentication
- Winston for logging
- Prometheus for metrics
- Docker for containerization

## Prerequisites

- Node.js (v16+)
- PostgreSQL (v14+)
- Docker & Docker Compose (optional)

## Quick Start

The recommended way to run the service is using Docker Compose from the root of the project:

```bash
# Start the entire system including PostgreSQL and other services
docker-compose up -d

# Or to start only the user service and its dependencies
docker-compose up -d postgres user-service app
```

This will automatically set up PostgreSQL with the required schema and start the service with all necessary configurations.

## API Endpoints

### Authentication

| Method | Path                | Description                          | Access      |
|--------|---------------------|--------------------------------------|-------------|
| POST   | `/api/auth/register`| Register a new user account          | Public      |
| POST   | `/api/auth/login`   | Authenticate a user                  | Public      |

### User Management

| Method | Path                       | Description                                | Access                |
|--------|----------------------------|--------------------------------------------|----------------------|
| GET    | `/api/users/me`            | Get current user's profile                 | Authenticated        |
| GET    | `/api/users`               | Get all users (paginated)                  | Admin only           |
| GET    | `/api/users/:id`           | Get a specific user                        | Owner or Admin       |
| POST   | `/api/users`               | Create a new user                          | Admin only           |
| PATCH  | `/api/users/:id`           | Update a user                              | Owner or Admin       |
| PATCH  | `/api/users/me`            | Update current user                        | Authenticated        |
| PATCH  | `/api/users/:id/password`  | Update a user's password                   | Owner only           |
| DELETE | `/api/users/:id`           | Delete a user                              | Owner or Admin       |
| GET    | `/api/users/batch`         | Get multiple users by IDs                  | Admin only (Internal)|

## Environment Variables

Configuration variables are specified in `.env.sample`. Copy this file to create your own `.env` file:

```bash
cp .env.sample .env
# Then edit .env with your configuration
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload

## Monitoring

The service exposes the following monitoring endpoints:

- `/health` - Health check endpoint
- `/metrics` - Prometheus metrics endpoint

## Architecture

User Service follows a standard layered architecture:

- **Controllers**: Handle HTTP requests
- **Services**: Contain business logic
- **Models**: Define data structures
- **Middlewares**: Implement cross-cutting concerns
- **Routes**: Define API endpoints

## Integration with Other Services

This service is called by the Order Service to:
- Validate user existence
- Get user information
- Verify user permissions

## Contribution Guidelines

1. Create a feature branch from `master`
2. Make your changes
4. Submit a pull request
