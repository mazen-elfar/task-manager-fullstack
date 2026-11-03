# Full-Stack Task Manager (`task-manager-fullstack`)

A modern, production-grade Full-Stack Task Management system built with Node.js, Express, TypeScript, MongoDB, React, Vite, and Tailwind CSS.

## Overview

This repository contains an end-to-end task management web application designed with enterprise-level architecture:
- **Backend**: Express + TypeScript RESTful API with MongoDB/Mongoose, JWT authentication with secure HTTP-only cookie support, Zod validation, rate limiting, and security headers.
- **Frontend**: Single Page Application built with React 19, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form, and Axios.
- **Security**: Password hashing with bcrypt, strict ownership checks on every task endpoint, CORS protection, helmet headers, and centralized error handling.
- **Testing**: Automated integration tests with Vitest, Supertest, and React Testing Library.

## Repository Structure

```
task-manager-fullstack/
├── frontend/             # React + Vite + TypeScript + Tailwind CSS application
├── backend/              # Express + TypeScript + MongoDB API service
├── docs/                 # Architecture and API documentation
│   ├── architecture.md
│   └── api.md
├── package.json          # Root monorepo workspace configuration
├── .gitignore
└── README.md
```

## Quick Start

See subdirectories for individual instructions:
- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [Architecture Guide](docs/architecture.md)
- [API Reference](docs/api.md)
