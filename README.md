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

### Initial Admin User

There is no seeding logic here; create an admin directly in MongoDB (e.g. via MongoDB Atlas UI):

```json
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "<bcrypt-hashed-password>",
  "role": "admin"
}
```

Or temporarily insert via a script, but the model expects:

- `role`: `"admin"` or `"student"`
- `password`: **hashed** (bcrypt)

### Authentication Flow (Header-Based JWT)

- Client logs in with email + password.
- Server verifies creds and returns a **JWT** plus the user object (without password).
- Client must include the token on each protected request:

```http
Authorization: Bearer <jwt_token_here>
```

#### Login

- **URL**: `POST /api/auth/login`
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

After starting the server, interactive API docs are available at:

- `GET /docs`

This is backed by an OpenAPI 3 spec defined in `src/config/swagger.ts`.

### Deployment

You can deploy this Node/Express app to services like Render, Railway, or similar platforms:

- Ensure environment variables are configured on the platform (same as `.env`).
- Use:
  - **Build command**: `npm run build`
  - **Start command**: `npm start`

Add the live URL to this section once deployed.

