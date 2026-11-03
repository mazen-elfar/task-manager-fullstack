# Full-Stack Task Manager API Reference (v1)

Base URL: `/api/v1`

All responses follow a consistent JSON schema:
- **Success**: `{ "success": true, ...data }`
- **Error**: `{ "success": false, "error": { "code": string, "message": string, "details"?: array } }`

---

## Authentication Endpoints

### 1. Register User
`POST /api/v1/auth/register`

Creates a new user account, hashes the password, and returns the user object along with an authentication token and `Set-Cookie` header.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "673f8a0026e680a6c6a1e39a",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2026-11-03T20:00:00.000Z",
    "updatedAt": "2026-11-03T20:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Headers:**
```
Set-Cookie: token=eyJhbGciOi...; Path=/; HttpOnly; SameSite=Lax
```

**Error Responses:**
- `400 Bad Request`: Validation failure (name < 2 chars, invalid email, password < 8 chars)
- `409 Conflict`: Email already registered

---

### 2. Login User
`POST /api/v1/auth/login`

Authenticates credentials and establishes session.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "673f8a0026e680a6c6a1e39a",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2026-11-03T20:00:00.000Z",
    "updatedAt": "2026-11-03T20:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid email or password

---

### 3. Get Authenticated User Profile
`GET /api/v1/auth/me`

Retrieves current authenticated user session data.

**Request Headers:**
```
Authorization: Bearer <token> (or Cookie: token=<token>)
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "673f8a0026e680a6c6a1e39a",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2026-11-03T20:00:00.000Z",
    "updatedAt": "2026-11-03T20:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing, expired, or invalid token

---

### 4. Logout User
`POST /api/v1/auth/logout`

Clears authentication cookie and ends session.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Task Management Endpoints

All task endpoints require authentication (`Authorization: Bearer <token>` or `Cookie: token=<token>`).

### 5. List Tasks
`GET /api/v1/tasks`

Retrieves a paginated list of tasks belonging strictly to the authenticated user.

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `search` | string | - | Case-insensitive search on title and description |
| `status` | string | `all` | Filter by `all`, `pending`, or `completed` |
| `priority` | string | `all` | Filter by `all`, `low`, `medium`, or `high` |
| `page` | number | `1` | Page number |
| `limit` | number | `50` | Items per page (max: 100) |
| `sortBy` | string | `createdAt` | Sort field: `createdAt`, `dueDate`, `title`, `priority` |
| `sortOrder` | string | `desc` | Sort direction: `asc` or `desc` |

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/tasks?status=pending&search=deploy" \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "673f910026e680a6c6a1e41b",
      "title": "Deploy API to Cloud",
      "description": "Configure Render environment variables",
      "status": "pending",
      "priority": "high",
      "dueDate": "2026-12-31T23:59:59.000Z",
      "userId": "673f8a0026e680a6c6a1e39a",
      "createdAt": "2026-11-03T20:15:00.000Z",
      "updatedAt": "2026-11-03T20:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

### 6. Create Task
`POST /api/v1/tasks`

Creates a new task. Ownership is automatically and strictly derived from the verified authentication token (`req.user.id`).

**Request Body:**
```json
{
  "title": "Write unit tests",
  "description": "Achieve high coverage on authentication routes",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-11-15T00:00:00.000Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "id": "673f92a126e680a6c6a1e42c",
    "title": "Write unit tests",
    "description": "Achieve high coverage on authentication routes",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-11-15T00:00:00.000Z",
    "userId": "673f8a0026e680a6c6a1e39a",
    "createdAt": "2026-11-03T20:20:00.000Z",
    "updatedAt": "2026-11-03T20:20:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing title, title > 200 chars, description > 2000 chars, or invalid status/priority.

---

### 7. Get Task by ID
`GET /api/v1/tasks/:id`

Retrieves a single task. Enforces that the task belongs to the authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "task": {
    "id": "673f92a126e680a6c6a1e42c",
    "title": "Write unit tests",
    "description": "Achieve high coverage on authentication routes",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-11-15T00:00:00.000Z",
    "userId": "673f8a0026e680a6c6a1e39a",
    "createdAt": "2026-11-03T20:20:00.000Z",
    "updatedAt": "2026-11-03T20:20:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Task does not exist OR belongs to another user (prevents IDOR and enumeration)
- `400 Bad Request`: Malformed ObjectId format

---

### 8. Update Task
`PATCH /api/v1/tasks/:id`

Updates fields of an existing task owned by the authenticated user.

**Request Body (Partial update allowed):**
```json
{
  "status": "completed",
  "priority": "medium"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "id": "673f92a126e680a6c6a1e42c",
    "title": "Write unit tests",
    "description": "Achieve high coverage on authentication routes",
    "status": "completed",
    "priority": "medium",
    "dueDate": "2026-11-15T00:00:00.000Z",
    "userId": "673f8a0026e680a6c6a1e39a",
    "createdAt": "2026-11-03T20:20:00.000Z",
    "updatedAt": "2026-11-03T20:25:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Task not found or not owned by user

---

### 9. Delete Task
`DELETE /api/v1/tasks/:id`

Permanently deletes a task owned by the authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Task not found or not owned by user

---

## Health Check Endpoint

### 10. Health Status
`GET /health`

Public health check endpoint for uptime monitors (Vercel, Render, Railway, Kubernetes, Pingdom).

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-11-03T20:30:00.000Z",
  "uptime": 1245.32,
  "environment": "production"
}
```
