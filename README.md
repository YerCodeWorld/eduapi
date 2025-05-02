# EduGuiders API

A RESTful API service providing backend functionality for the EduGuiders educational platform.

## Overview

This API handles user management, testimonials, and other data services for the EduGuiders platform. Built with Express.js and Prisma ORM, it provides a reliable interface to the PostgreSQL database.

## Features

- **User Management**: Registration, authentication, and profile management
- **Testimonials System**: Creation and retrieval of user testimonials
- **Database Integration**: Secure connection to PostgreSQL database
- **RESTful Architecture**: Clean and consistent API endpoints
- **CORS Support**: Configured for cross-origin requests

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Prisma**: ORM for database interactions
- **PostgreSQL**: Database
- **TypeScript**: Type-safe coding
- **PM2**: Production process manager
- **Nginx**: Reverse proxy (in production)

## Deployment

This application is currently deployed at [api.eduguiders.com](https://api.eduguiders.com).

### Production Setup

1. **Prerequisites**:
    - Node.js (v20.x)
    - PM2 globally installed
    - PostgreSQL database
    - Nginx (for production)

2. **Environment Variables**:
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   PORT=3001
   NODE_ENV=production
   PRISMA_CLIENT_ENGINE_TYPE=binary
   PRISMA_QUERY_ENGINE_TYPE=binary
   ```

3. **Installation**:
   ```bash
   # Install dependencies
   pnpm install
   
   # Generate Prisma client
   npx prisma generate --schema=./DbClient/prisma/schema.prisma
   
   # Run database migrations
   npx prisma migrate deploy --schema=./DbClient/prisma/schema.prisma
   
   # Build the application
   pnpm build
   ```

4. **Running with PM2**:
   ```bash
   NODE_ENV=production pm2 start dist/src/index.js --name eduapi
   pm2 save
   ```

## API Endpoints

### Users

- **GET /api/users**: Get all users
- **GET /api/users/email/:email**: Get user by email
- **POST /api/users**: Create a new user
- **PUT /api/users/email/:email**: Update user information

### Testimonies

- **GET /api/testimonies**: Get all testimonies
- **GET /api/testimonies/featured**: Get featured testimonies
- **GET /api/testimonies/user/:email**: Get testimonies by user email
- **POST /api/testimonies**: Create a new testimony

## Development

### Local Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/eduguiders
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate --schema=./DbClient/prisma/schema.prisma
   ```
5. Run the development server:
   ```bash
   pnpm dev
   ```

### Database Management

- **Generate Prisma client**:
  ```bash
  npx prisma generate --schema=./DbClient/prisma/schema.prisma
  ```
- **Apply migrations**:
  ```bash
  npx prisma migrate dev --schema=./DbClient/prisma/schema.prisma
  ```
- **Open Prisma Studio**:
  ```bash
  npx prisma studio --schema=./DbClient/prisma/schema.prisma
  ```

## CORS Configuration

The API is configured to accept requests from the following origins:
- https://localhost:5173
- http://localhost:5173
- https://api.eduguiders.com
- http://api.eduguiders.com
- https://eduguiders.com
- http://eduguiders.com

To add additional origins, modify the cors configuration in `src/index.ts`.

## Troubleshooting

- **Prisma Client Issues**: If you encounter Prisma client errors, try regenerating the client using:
  ```bash
  npx prisma generate --schema=./DbClient/prisma/schema.prisma
  ```

- **Database Connection**: Ensure your database connection string is correct and the database is accessible.

- **PM2 Restart Loop**: If your application keeps restarting in PM2, check the logs with `pm2 logs eduapi` to identify the issue.

## License

Copyright (c) 2025 EduGuiders. All rights reserved.