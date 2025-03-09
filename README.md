# Order Management System

A demonstration project showing the transition from a monolithic architecture to microservices. This system allows for managing users and their orders through a RESTful API with a React frontend.

## Project Overview

This project illustrates best practices for building a modular monolithic system that can be easily migrated to microservices in the future. The application has been designed with clear boundaries between different domains (users and orders) to facilitate this future transition.

### Key Features

- User authentication and authorization using JWT
- User management (CRUD operations)
- Order management (creation, listing, status updates)
- RESTful API design
- React frontend with responsive UI
- Docker containerization
- PostgreSQL database
- Modular code organization for easy microservice migration

## Architecture

The system follows a layered architecture:

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
- PostgreSQL
- JWT for authentication
- Winston for logging

### Frontend
- React
- React Router
- React Bootstrap
- Formik and Yup for form handling
- Axios for API calls

### DevOps
- Docker
- Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/order-management-system.git
   cd order-management-system
   ```

2. Start the application with Docker Compose
   ```bash
   docker-compose up --build
   ```

3. Access the application
    - Backend API: http://localhost:3000
    - Frontend: http://localhost:3001
    - Database: PostgreSQL on port 5432

### Default Users

The system is pre-populated with the following users:

- Admin: admin@example.com / password123
- Customer: john@example.com / password123
- Customer: jane@example.com / password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a user (admin only)
- `PATCH /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user
- `GET /api/users/me` - Get current user
- `PATCH /api/users/:id/password` - Update user password

### Orders
- `GET /api/orders` - Get all orders (filtered by user for non-admins)
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete an order
- `GET /api/users/:userId/orders` - Get orders for a specific user

## Project Structure

```
order-management-system/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   ├── db.js
│   │   └── auth.js
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── order.routes.js
│   │   └── auth.routes.js
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── order.controller.js
│   │   └── auth.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── order.model.js
│   ├── services/
│   │   ├── user.service.js
│   │   ├── order.service.js
│   │   └── auth.service.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   └── utils/
│       ├── logger.js
│       └── validation.js
├── migrations/
│   ├── init.sql
│   └── seed.sql
└── client/
    ├── package.json
    ├── public/
    │   ├── index.html
    │   └── favicon.ico
    └── src/
        ├── index.js
        ├── App.js
        ├── api/
        │   ├── users.js
        │   ├── orders.js
        │   └── auth.js
        ├── components/
        │   ├── Header.jsx
        │   ├── UserList.jsx
        │   ├── UserForm.jsx
        │   ├── OrderList.jsx
        │   ├── OrderForm.jsx
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Users.jsx
        │   ├── Orders.jsx
        │   ├── UserDetail.jsx
        │   ├── OrderDetail.jsx
        │   └── Auth.jsx
        └── context/
            └── AuthContext.jsx
```

## Microservices Migration Path

This project is designed to be easily migrated to a microservices architecture. The future migration path would involve:

1. **Database Separation**
    - Create separate databases for users and orders
    - Implement data synchronization or inter-service communication

2. **Service Separation**
    - Extract user and order services into separate projects
    - Implement inter-service communication via API calls

3. **API Gateway**
    - Add API gateway for request routing and aggregation
    - Implement service discovery

4. **Resilience**
    - Add circuit breakers for fault tolerance
    - Implement retries and fallbacks

5. **Observability**
    - Centralized logging system
    - Distributed tracing
    - Health monitoring

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have invested their time in improving this project.
- Special thanks to the JavaScript, Node.js, React, and PostgreSQL communities for their excellent documentation and tools.
