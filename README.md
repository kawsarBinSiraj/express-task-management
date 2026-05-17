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

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and adjust the values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/starter_kit?schema=public"
JWT_SECRET=your_super_secret_key
NODE_ENV=development
PORT=5000
```

### 3. Generate Prisma client

```bash
npm run db:generate
```

Prisma 7 generates the client into `src/generated/prisma`, so run this again after schema changes.

### 4. Push schema or run migrations

```bash
npm run db:push
```

Or, if you want migration files:

```bash
npm run db:migrate
```

### 5. Start the full app in development

```bash
npm run dev
```

This starts:

- the Express backend at `http://localhost:5000`
- the React client panel on the main domain via Express
- the API under `http://localhost:5000/api`

## Scripts

- `npm run dev` starts Express and the Vite-powered client panel together
- `npm run dev:server` starts only the Express backend
- `npm run dev:client` starts only the client Vite dev server
- `npm run build` compiles the backend and builds the client assets into `build/`
- `npm run start` runs the compiled production build
- `npm run db:generate` regenerates the Prisma client
- `npm run db:push` pushes the schema without migrations
- `npm run db:migrate` creates and applies migrations
- `npm run db:studio` opens Prisma Studio

## Notes

- Prisma 7 now uses `prisma.config.ts` for the datasource URL.
- The app uses `@prisma/adapter-pg` with the `pg` driver for standard PostgreSQL connections.
- `DATABASE_URL` is required when the server starts and when Prisma generates the client.

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

## Task Model

| Field       | Type     | Description                                   |
|-------------|----------|-----------------------------------------------|
| id          | UUID     | Auto-generated                                |
| title       | String   | Task title                                    |
| description | String?  | Optional description                          |
| status      | Enum     | `TODO`, `IN_PROGRESS`, `DONE`                 |
| priority    | Enum     | `LOW`, `MEDIUM`, `HIGH`                       |
| userId      | UUID     | Owner (foreign key → User)                    |
| createdAt   | DateTime | Auto-set on creation                          |
| updatedAt   | DateTime | Auto-updated on change                        |

## Routing Model

- `/api/auth/*` — authentication routes
- `/api/tasks/*` — task CRUD routes (protected)
- any other browser route → React client panel
- React Router manages client-side pages (dashboard, task list, task detail, etc.)

## License

MIT
