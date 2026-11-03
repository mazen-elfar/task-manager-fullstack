# Task Manager API Reference (v1)

Base URL: `/api/v1`

## Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate user credentials & issue token | No |
| `POST` | `/api/v1/auth/logout` | Invalidate / clear authentication session | Yes |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |

## Task Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/tasks` | List authenticated user tasks (supports search & filter) | Yes |
| `POST` | `/api/v1/tasks` | Create a new task for the authenticated user | Yes |
| `GET` | `/api/v1/tasks/:id` | Retrieve specific task owned by user | Yes |
| `PATCH` | `/api/v1/tasks/:id` | Update task details / status | Yes |
| `DELETE` | `/api/v1/tasks/:id` | Delete task owned by user | Yes |

## Health Check

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Server health and uptime status | No |
