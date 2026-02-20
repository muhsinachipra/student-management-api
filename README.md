## Student Management API (TypeScript, Express, MongoDB)

**Stack**: Node.js, Express, TypeScript, MongoDB Atlas (Mongoose), JWT auth, bcrypt, Zod validation, Swagger docs.

API supports **admin** and **student** roles using a **single `User` collection** with a `role` field. Authentication is **token-based** (`Authorization: Bearer <token>`). **No sessions or cookies** are used.

### Project Structure

```text
src/
  config/       # env + MongoDB + Swagger
  controllers/  # Request handlers (auth, admin, student)
  models/       # Mongoose models (User, Task)
  routes/       # Route definitions
  middleware/   # Auth, admin guard, error handler
  utils/        # Async handler, validators, HttpError
  types/        # Shared TS types and Express augmentation
  app.ts        # Express bootstrap
```

### Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace_me_with_a_long_random_secret
JWT_EXPIRES_IN=1d
DEFAULT_ADMIN_EMAIL=admin@admin.com           # optional, see "Initial Admin User"
DEFAULT_ADMIN_PASSWORD=admin123              # optional, see "Initial Admin User"
```

### Installation & Local Run

```bash
npm install

# development (ts-node + nodemon)
npm run dev

# production build & run
npm run build
npm start
```

By default the server listens on **`http://localhost:${PORT}`** (3000 if not overridden).

### Health Check

- **Production URL**: [https://student-management-api-86e9.onrender.com/health](https://student-management-api-86e9.onrender.com/health)
- **Local URL**: `GET http://localhost:3000/health`
- **Response**:

```json
{ "status": "ok" }
```

### Initial Admin User

On startup the app **automatically seeds a default admin user** if no admin exists yet.

- The seeded credentials come from the environment:
  - `DEFAULT_ADMIN_EMAIL` (falls back to `admin@admin.com` if not set)
  - `DEFAULT_ADMIN_PASSWORD` (falls back to `admin123` if not set)
- The seed runs once: if an admin already exists, it does nothing.

Example `.env` snippet:

```bash
DEFAULT_ADMIN_EMAIL=super.admin@mydomain.com
DEFAULT_ADMIN_PASSWORD=some-strong-password
```

**Security note**: In production, always use strong unique values, rotate them after first login, and never keep the default credentials.

### Authentication Flow (Header-Based JWT)

- Client logs in with email + password.
- Server verifies creds and returns a **JWT** plus the user object (without password).
- Client must include the token on each protected request:

```http
Authorization: Bearer <jwt_token_here>
```

#### Login

- **URL**: `POST /api/auth/login`
- **Production**: `POST https://student-management-api-86e9.onrender.com/api/auth/login`
- **Body**:

```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

- **Response** (`200 OK`):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65f3d3d3d3d3d3d3d3d3d3d3",
    "name": "Admin",
    "email": "admin@test.com",
    "role": "admin",
    "createdAt": "2026-02-20T16:00:00.000Z",
    "updatedAt": "2026-02-20T16:00:00.000Z",
    "__v": 0
  }
}
```

### Admin Routes (`/api/admin`)

All admin routes are protected by:

- `authenticate` → decodes JWT and attaches `req.user`
- `isAdmin` → ensures `req.user.role === "admin"`

#### Add Student

- **URL**: `POST /api/admin/add-student`
- **Production**: `POST https://student-management-api-86e9.onrender.com/api/admin/add-student`
- **Headers**:

```http
Authorization: Bearer <admin_jwt>
Content-Type: application/json
```

- **Body**:

```json
{
  "name": "Jane Student",
  "email": "jane@student.com",
  "password": "password123",
  "department": "Computer Science"
}
```

- **Response** (`201 Created`):

```json
{
  "student": {
    "_id": "65f3d3d3d3d3d3d3d3d3d3d4",
    "name": "Jane Student",
    "email": "jane@student.com",
    "role": "student",
    "department": "Computer Science",
    "createdAt": "2026-02-20T16:05:00.000Z",
    "updatedAt": "2026-02-20T16:05:00.000Z",
    "__v": 0
  }
}
```

#### Assign Task

- **URL**: `POST /api/admin/assign-task`
- **Production**: `POST https://student-management-api-86e9.onrender.com/api/admin/assign-task`
- **Headers**:

```http
Authorization: Bearer <admin_jwt>
Content-Type: application/json
```

- **Body**:

```json
{
  "studentId": "65f3d3d3d3d3d3d3d3d3d3d4",
  "description": "Submit assignment 1",
  "dueTime": "2026-02-25T18:00:00.000Z"
}
```

- **Response** (`201 Created`):

```json
{
  "task": {
    "_id": "65f3d3d3d3d3d3d3d3d3d3d5",
    "description": "Submit assignment 1",
    "assignedTo": "65f3d3d3d3d3d3d3d3d3d3d4",
    "dueTime": "2026-02-25T18:00:00.000Z",
    "status": "pending",
    "createdAt": "2026-02-20T16:10:00.000Z",
    "updatedAt": "2026-02-20T16:10:00.000Z",
    "__v": 0
  }
}
```

### Student Routes (`/api/student`)

All student routes are protected by `authenticate` (valid JWT required).

#### Get My Tasks

- **URL**: `GET /api/student/tasks`
- **Headers**:

```http
Authorization: Bearer <student_jwt>
```

- **Response** (`200 OK`):

```json
{
  "tasks": [
    {
      "_id": "65f3d3d3d3d3d3d3d3d3d3d5",
      "description": "Submit assignment 1",
      "assignedTo": "65f3d3d3d3d3d3d3d3d3d3d4",
      "dueTime": "2026-02-25T18:00:00.000Z",
      "status": "pending", // or "overdue" or "completed"
      "createdAt": "2026-02-20T16:10:00.000Z",
      "updatedAt": "2026-02-20T16:10:00.000Z",
      "__v": 0
    }
  ]
}
```

**Overdue Logic**:

- Database only stores `status` as `"pending"` or `"completed"`.
- On fetch, the controller calculates a **display status**:
  - If `status === "completed"` → `"completed"`.
  - If `status === "pending"` and `dueTime < now` → `"overdue"`.
  - Else → `"pending"`.

#### Mark Task as Completed

- **URL**: `PATCH /api/student/tasks/:taskId/status`
- **Headers**:

```http
Authorization: Bearer <student_jwt>
Content-Type: application/json
```

- **Body**:

```json
{
  "status": "completed"
}
```

- **Notes**:
  - A student **can only update their own tasks**. If a task does not belong to the logged-in user, the API returns `403 Forbidden`.

- **Response** (`200 OK`):

```json
{
  "task": {
    "_id": "65f3d3d3d3d3d3d3d3d3d3d5",
    "description": "Submit assignment 1",
    "assignedTo": "65f3d3d3d3d3d3d3d3d3d3d4",
    "dueTime": "2026-02-25T18:00:00.000Z",
    "status": "completed",
    "createdAt": "2026-02-20T16:10:00.000Z",
    "updatedAt": "2026-02-20T16:15:00.000Z",
    "__v": 0
  }
}
```

### Validation & Error Handling

- **Validation**: All input payloads are validated using **Zod** (e.g., login, add-student, assign-task, update-status).
- **Errors**:
  - Validation errors return `400` with details.
  - Auth failures return `401`.
  - Role violations return `403`.
  - Not found resources return `404`.
  - Unexpected errors return `500`.

### API Documentation (Swagger)

Interactive API docs are available at:

- **Production**: [https://student-management-api-86e9.onrender.com/api-docs](https://student-management-api-86e9.onrender.com/api-docs)
- **Local**: `http://localhost:3000/api-docs` (when running locally)

This is backed by an OpenAPI 3 spec defined in `src/config/swagger.ts`.

### Deployment

This API is deployed and available at:

**Production URL**: [https://student-management-api-86e9.onrender.com](https://student-management-api-86e9.onrender.com)

**API Base URL**: `https://student-management-api-86e9.onrender.com/api`

**Health Check**: [https://student-management-api-86e9.onrender.com/health](https://student-management-api-86e9.onrender.com/health)

**Swagger Documentation**: [https://student-management-api-86e9.onrender.com/api-docs](https://student-management-api-86e9.onrender.com/api-docs)

#### Deployment Details

Deployed on Render. To deploy to similar platforms (Render, Railway, etc.):

- Ensure environment variables are configured on the platform (same as `.env`).
- Use:
  - **Build command**: `npm run build`
  - **Start command**: `npm start`

