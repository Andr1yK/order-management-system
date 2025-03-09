# Order Management System Development Guide

## Commands
### Server (Root Directory)
- Start: `npm start`
- Dev mode: `npm run dev`
- Tests: `npm test`
- Migrations: `npm run migrate:up`, `npm run migrate:down`, `npm run migrate:create`
- Combined: `npm run migrate-and-start`, `npm run migrate-and-dev`

### Client Directory
- Start: `cd client && npm start`
- Build: `cd client && npm run build`

## Code Style Guidelines
- **Backend**: 2-space indent, single quotes, semicolons, camelCase variables/functions
- **File naming**: lowercase with dot notation (user.controller.js)
- **Components**: Functional with hooks, PascalCase names with .jsx extension
- **Error handling**: Custom ApiError class, try/catch blocks, centralized middleware
- **Imports order**: Node built-ins → External deps → Internal modules
- **State management**: Context API for global state, useState for local state
- **API pattern**: Controllers → Services → Models
- **Database fields**: snake_case for database column names
- **Documentation**: JSDoc for API endpoints and key functions

## Docker
Run full stack: `docker-compose up --build`
