# System Architecture: Task Manager Full-Stack

## 1. System Overview

The Task Manager application is designed as a decoupled, multi-tier full-stack system consisting of:
1. **Client Tier**: Single Page Application (SPA) built using React, Vite, TypeScript, and Tailwind CSS.
2. **Application Tier**: RESTful API built on Node.js, Express, and TypeScript, structured using modular layered architecture (Routes -> Controllers -> Services -> Models).
3. **Data Tier**: MongoDB document database modeled with Mongoose schemas and optimized with composite indexes for user-scoped queries.

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    Client[React Client SPA (Vite + Tailwind)]
    API[Express REST API Gateway]
    AuthMiddleware[Authentication & Ownership Middleware]
    TaskService[Task Service & Business Logic]
    UserService[User & Auth Service]
    MongoDB[(MongoDB Database)]

    Client -->|HTTPS / JSON / Cookies / Bearer| API
    API --> AuthMiddleware
    AuthMiddleware -->|Authenticated Session| TaskService
    AuthMiddleware -->|Auth Actions| UserService
    TaskService --> MongoDB
    UserService --> MongoDB
```

## 3. Data Flow & Authentication Model

1. **Registration & Login**: User submits credentials. Backend verifies and hashes passwords using `bcryptjs` (salt rounds: 12).
2. **Token Strategy**: Upon authentication, a JSON Web Token (JWT) is issued with user ID payload.
3. **Session Delivery**: Delivered via `HttpOnly`, `SameSite`, and `Secure` (in production) cookies, or Bearer Authorization header for maximum flexibility and security.
4. **Authorization & Ownership**: Every task request parses verified user context from the JWT. Database queries enforce `{ _id: taskId, userId: authenticatedUserId }` to strictly isolate tenant data and prevent Insecure Direct Object References (IDOR).
