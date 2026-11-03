# Task Manager API Backend

RESTful backend service for the Task Manager application, built with Express, TypeScript, and MongoDB.

## Features

- **TypeScript Architecture**: Strict typing across controllers, services, models, validators, and middlewares.
- **Authentication**: Bcrypt password hashing + JWT with HttpOnly cookie support and Bearer token fallback.
- **Authorization & Security**: Insecure Direct Object Reference (IDOR) prevention, Helmet security headers, CORS origin enforcement, and express-rate-limit.
- **Input Validation**: Schema-driven request validation using Zod.
- **Testing**: Automated integration tests with Vitest, Supertest, and `mongodb-memory-server`.

## Available Scripts

```bash
# Install dependencies
npm install

# Run development server with hot-reload
npm run dev

# Run TypeScript compilation
npm run build

# Run test suite
npm test

# Run type-checking without emitting
npm run lint

# Start production build
npm start
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=super_secret_jwt_key_change_in_production_min_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
