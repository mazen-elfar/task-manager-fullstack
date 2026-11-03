# TaskMaster | Full-Stack Task Manager

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-green.svg)](https://mongoosejs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-50_Passing-brightgreen.svg)](https://vitest.dev/)

A robust, production-grade, end-to-end Full-Stack Task Management web application built from scratch with Node.js, Express, TypeScript, MongoDB, React, Vite, and Tailwind CSS.

---

## 1. Project Overview

TaskMaster is an enterprise-oriented task management system that provides a secure, intuitive, and responsive platform for organizing deliverables, tracking progress, and collaborating within a protected environment. The system features multi-tenant data isolation, cryptographic security best practices, and a polished user interface adhering to WCAG accessibility and modern design standards.

---

## 2. Key Features

### Authentication & Security
- **User Registration & Login**: Account creation with name, email, password, and confirmation validation.
- **Password Security**: Cryptographically salted password hashing using `bcryptjs` (cost factor: 12). Passwords are never returned in responses.
- **Session Persistence**: JWT session tokens with HttpOnly, Secure, and SameSite cookie options plus Bearer token authorization header support.
- **Multi-Tenant Data Isolation**: Strict ownership enforcement on every task endpoint (`{ _id, userId }`), preventing Insecure Direct Object Reference (IDOR) vulnerabilities.
- **Consistent Enumeration Defense**: Attempts to access or alter another user's task consistently return `404 Not Found`.
- **Security Middleware**: Helmet security headers, CORS origin enforcement, request payload size limits (`100kb`), and rate limiting (brute-force defense).

### Task Workspace & Management
- **Task CRUD**: Create, read, edit, and delete tasks with title, description, status, priority, and optional due dates.
- **Status Lifecycle**: Instant toggling between `pending` and `completed` with optimistic UI updates.
- **Search & Filtering**: Real-time substring search by title/description combined with status tabs (`All`, `Pending`, `Completed`) and priority filters (`All`, `Low`, `Medium`, `High`).
- **Productivity Metrics**: Real-time progress stats showing Total, Pending, and Completed counts alongside a completion percentage bar.
- **Safety Dialogs**: Accessible confirmation modal for task deletion.
- **Toast Notifications**: Automatic non-intrusive feedback for actions (create, update, toggle, delete, error).
- **Responsive Navigation**: Adaptive mobile drawer navigation and sticky desktop sidebar.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router DOM v7, React Hook Form, Zod, Axios, Lucide React, Date-fns |
| **Backend** | Node.js, Express, TypeScript, MongoDB, Mongoose, Zod, Bcryptjs, JsonWebToken, Helmet, Cors, Express-Rate-Limit, Cookie-Parser |
| **Testing** | Vitest, Supertest, React Testing Library, MongoMemoryServer, JSDOM |
| **DevOps & Tooling** | Docker, Docker Compose, NPM Workspaces, TSX, Git |

---

## 4. Architecture & Directory Structure

```
task-manager-fullstack/
├── backend/                  # Express REST API workspace
│   ├── src/
│   │   ├── config/           # Database and validated environment variables
│   │   ├── controllers/      # HTTP request/response handlers
│   │   ├── middleware/       # Auth guard, error handling, 404 handler
│   │   ├── models/           # Mongoose schemas (User, Task) with compound indexes
│   │   ├── routes/           # Versioned API route definitions (/api/v1)
│   │   ├── services/         # Business logic and database operations
│   │   ├── utils/            # Structured logger, custom operational errors
│   │   ├── validators/       # Zod schemas for request validation
│   │   ├── app.ts            # Express application factory & middleware chain
│   │   └── server.ts         # Server bootstrap with graceful shutdown
│   ├── tests/                # Automated backend integration and E2E test suites
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React SPA workspace
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Reusable UI (Button, Input, Badge, Card, Modal, Spinner, Toast)
│   │   │   ├── layout/       # AppLayout, Navbar, Sidebar
│   │   │   └── tasks/        # TaskCard, TaskStats, TaskFilterBar, TaskFormModal, TaskDeleteDialog
│   │   ├── features/auth/    # AuthContext, useAuth hook
│   │   ├── pages/            # LoginPage, RegisterPage, DashboardPage, NotFoundPage
│   │   ├── routes/           # ProtectedRoute, PublicRoute guards
│   │   ├── services/         # Axios client and typed API services
│   │   ├── types/            # TypeScript data contracts (Auth, Task)
│   │   ├── lib/              # Tailwind utility helpers (cn)
│   │   ├── App.tsx           # Route declaration tree
│   │   └── main.tsx          # DOM mount
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/                     # Technical specifications
│   ├── architecture.md       # High-level architecture, Mermaid diagrams, security model
│   └── api.md                # Comprehensive RESTful API endpoint documentation
├── docker-compose.yml        # Multi-container orchestration
├── package.json              # Monorepo root workspace orchestrator
├── .gitignore
└── README.md
```

---

## 5. Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on `v22.17.0`)
- **NPM**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/taskmanager`) OR MongoDB Atlas URI. *(Note: Automated tests run with embedded in-memory MongoDB without requiring an external database)*.

---

## 6. Installation & Environment Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/mazen-elfar/task-manager-fullstack.git
cd task-manager-fullstack
```

### Step 2: Install Dependencies
Install dependencies across both backend and frontend monorepo workspaces:
```bash
npm install
```

### Step 3: Configure Environment Variables

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
```
Default configuration values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=super_secret_jwt_key_change_in_production_min_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
```
Default configuration values:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 7. Local Development

You can run both backend and frontend concurrently or independently:

### Run Full Stack Simultaneously (Recommended)
```bash
# Starts Express API on http://localhost:5000 and Vite on http://localhost:5173
npm run dev
```

### Run Backend Only
```bash
npm run dev:backend
```

### Run Frontend Only
```bash
npm run dev:frontend
```

Open your browser at **http://localhost:5173** to use the application.

---

## 8. Automated Testing

The project contains a comprehensive automated test suite consisting of **50 passing tests** covering unit, component, API integration, and full end-to-end user journeys:

### Run All Tests Across Monorepo
```bash
npm test
```

### Run Backend Integration Tests Only (33 Tests)
Includes authentication, task CRUD, search/filtering, and cross-user isolation tests:
```bash
npm run test:backend
```

### Run Frontend Unit & Component Tests Only (17 Tests)
Includes form validations, protected route guards, and component interaction tests:
```bash
npm run test:frontend
```

---

## 9. Production Build

To compile and verify production bundles for both services:

```bash
# Builds backend TypeScript to dist/ and frontend Vite bundle to dist/
npm run build
```

Individual builds:
```bash
npm run build:backend
npm run build:frontend
```

---

## 10. API Specification Summary

The backend exposes a versioned RESTful API under `/api/v1`:

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `GET` | `/health` | Server health and uptime check | Public |
| `POST` | `/api/v1/auth/register` | Create user account & issue JWT | Public |
| `POST` | `/api/v1/auth/login` | Authenticate credentials & issue JWT | Public |
| `POST` | `/api/v1/auth/logout` | Invalidate cookie and clear session | Authenticated |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/v1/tasks` | List user's tasks with search/filters/pagination | Authenticated |
| `POST` | `/api/v1/tasks` | Create task owned by current user | Authenticated |
| `GET` | `/api/v1/tasks/:id` | Get specific task owned by current user | Authenticated |
| `PATCH` | `/api/v1/tasks/:id` | Update task details or status | Authenticated |
| `DELETE` | `/api/v1/tasks/:id` | Permanently delete task | Authenticated |

Detailed request/response schemas, error structures, and curl commands are available in [docs/api.md](docs/api.md).

---

## 11. Deployment Guide

### Option A: Docker Compose (Single Command)
Run the entire production stack locally or on any VPS:
```bash
docker-compose up --build
```

### Option B: Cloud Deployment (Vercel + Render/Railway)
1. **Database**: Create a free MongoDB database cluster on [MongoDB Atlas](https://www.mongodb.com/atlas). Obtain connection string.
2. **Backend (Render / Railway)**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
     - `JWT_SECRET`: `<64-character random string>`
     - `NODE_ENV`: `production`
     - `CLIENT_URL`: `<Your Vercel Frontend URL>`
3. **Frontend (Vercel)**:
   - Root Directory: `frontend`
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     - `VITE_API_BASE_URL`: `https://<your-backend-service>.onrender.com/api/v1`

---

## 12. License & Author

Developed by **Mazen Elfar** (`mazenalfar01@gmail.com`) for internship evaluation.
Licensed under the [MIT License](LICENSE).
