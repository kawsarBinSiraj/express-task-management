# Task Management App

A production-ready full-stack task management CRUD application built with Express 5, TypeScript, Prisma 7, JWT auth, PostgreSQL, and a React client panel served from the same app.

Users can create, view, update, and delete tasks. Each task supports a title, description, status, and priority. Authentication is required — every user manages their own tasks.

## Stack

- Node.js + Express.js 5
- TypeScript
- React 19 + React Router + Vite
- PostgreSQL + Prisma ORM 7
- JWT authentication
- Zod request validation
- Winston logging
- Helmet, CORS, and compression
- bcryptjs password hashing
- Morgan HTTP logging

## API Endpoints

### Health
- `GET /api/health`

### Auth
- `POST /api/auth/signup` — register a new user
- `POST /api/auth/signin` — sign in and receive a JWT
- `GET /api/auth/me` — get the authenticated user's profile

### Tasks (requires auth)
- `GET /api/tasks` — list all tasks for the authenticated user
- `POST /api/tasks` — create a new task
- `GET /api/tasks/:id` — get a single task
- `PATCH /api/tasks/:id` — update a task (title, description, status, priority)
- `DELETE /api/tasks/:id` — delete a task

## Routing Model

- `/api/auth/*` — authentication routes
- `/api/tasks/*` — task CRUD routes (protected)
- any other browser route → React client panel
- React Router manages client-side pages (dashboard, task list, task detail, etc.)

## API Documentation (Swagger UI)

Interactive API docs are available via **Swagger UI Express** at:

```
http://localhost:5000/api/docs
```

The raw OpenAPI 3.0.3 JSON spec is also served at:

```
http://localhost:5000/api/docs.json
```

### Features
- Browse all endpoints grouped by tag: **Health**, **Auth**, **Tasks**, **Users**
- View request bodies, query parameters, and response schemas
- Authenticate with a Bearer JWT token using the **Authorize** button (top-right) — authorization persists across page reloads
- Try out requests directly in the browser

### Usage
1. Start the server: `npm run dev`
2. Open `http://localhost:5000/api/docs` in your browser
3. Sign in via `POST /api/v1/auth/signin` to get a JWT
4. Click **Authorize**, paste the token, and all protected endpoints become testable

## License

MIT
