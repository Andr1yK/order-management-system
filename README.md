# E-commerce Microservices Platform

A comprehensive project demonstrating the transition from a monolithic architecture to microservices for an e-commerce platform. This system starts with core user and order management capabilities and progressively evolves into a full-featured e-commerce solution.

## Project Overview

This project illustrates best practices for building a modular monolithic system that can be easily migrated to microservices. The application has been designed with clear boundaries between different domains (users, orders, products, etc.) to facilitate this transition and support ongoing development into a complete e-commerce platform.

### Key Features

- User authentication and authorization using JWT
- User management (CRUD operations)
- Order management (creation, listing, status updates)
- RESTful API design
- React frontend with responsive UI
- Docker containerization
- PostgreSQL database with schema-per-service approach
- Modular code organization for easy microservice migration
- Comprehensive monitoring and observability

### Planned E-commerce Features

- Product catalog with categories and variants
- Shopping cart management
- Checkout process with simulated payment processing
- Inventory management
- Search and filtering capabilities
- Promotions and discounts
- Personalized recommendations
- Notifications system

## Architecture

The system follows a microservices architecture with clear domain boundaries:

### Current Microservices

- **API Gateway** (Monolith acting as proxy)
- **User Service** (Authentication, user management)
- **Order Service** (Order processing, order items)

### Planned Microservices

- **Product Catalog Service** (Products, categories, attributes)
- **Cart Service** (Shopping cart management)
- **Payment Service** (Payment processing simulation)
- **Inventory Service** (Stock management)
- **Search Service** (Product search and filtering)
- **Recommendation Service** (Personalized suggestions)
- **Promotion Service** (Discounts, coupons)
- **Notification Service** (Email, SMS, push notifications)

Each service follows a layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Models**: Handle database operations
- **Middlewares**: Provide cross-cutting concerns like authentication and error handling
- **Routes**: Define API endpoints
- **Config**: Application configuration
- **Utils**: Utility functions and helpers

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL with schema isolation
- JWT for authentication
- Winston for logging

### Frontend
- React
- React Router
- React Bootstrap
- Formik and Yup for form handling
- Axios for API calls

### DevOps & Observability
- Docker and Docker Compose
- Prometheus for metrics
- Grafana for dashboards
- Loki for log aggregation
- Tempo for distributed tracing

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/andr1yk/order-management-system.git
   cd order-management-system
   ```

2. Start the application with Docker Compose
   ```bash
   docker-compose up --build
   ```

3. Access the application
   - API Gateway: http://localhost:3000
   - Frontend: http://localhost:3001
   - Grafana: http://localhost:3002
   - Database: PostgreSQL on port 5432

### Default Users

The system is pre-populated with the following users:

- Admin: admin@example.com / password123
- Customer: john@example.com / password123
- Customer: jane@example.com / password123



## Microservices Migration Path

This project demonstrates a gradual migration path from monolith to microservices:

1. **Modular Monolith** - Starting point with modular design
2. **Database Isolation** - Using schema-per-service approach in PostgreSQL
3. **Service Extraction** - Moving functionality to separate services one by one
4. **API Gateway Integration** - Using the monolith as an API Gateway
5. **Event-driven Communication** - Implementing asynchronous communication between services
6. **Resilience Patterns** - Adding circuit breakers, retry mechanisms, etc.
7. **Advanced E-commerce Features** - Building additional services for a complete platform

## Monitoring and Observability

The system includes a comprehensive monitoring stack:

- **Metrics** - Prometheus for collecting application metrics
- **Visualization** - Grafana for dashboards and visualizations
- **Logging** - Loki for centralized log management
- **Tracing** - Tempo for distributed tracing across services

Access the Grafana dashboard at http://localhost:3002 (username: admin, password: admin)

## Development

### Adding a New Microservice

1. Create a new directory in the `microservices` folder
2. Set up the basic structure (controllers, services, models, routes)
3. Create a Dockerfile for the service
4. Add the service to docker-compose.yml
5. Update the API Gateway to route requests to the new service



## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
