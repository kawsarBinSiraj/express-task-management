/**
 * File: src/docs/swagger.ts
 * Purpose: Full OpenAPI 3.0.3 specification for the Task Management API.
 */

import { OpenAPIV3 } from 'openapi-types';

/* ── Reusable response shapes ─────────────────────────────────────────────── */

const successResponse = (description: string, dataSchema?: OpenAPIV3.SchemaObject): OpenAPIV3.ResponseObject => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: description },
          ...(dataSchema ? { data: dataSchema } : {}),
        },
      },
    },
  },
});

const errorResponse = (description: string, code = 400): OpenAPIV3.ResponseObject => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: description },
          ...(code === 422
            ? { errors: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } } }
            : {}),
        },
      },
    },
  },
});

const unauthorizedResponse = errorResponse('Authentication required.', 401);
const forbiddenResponse    = errorResponse('Forbidden — insufficient role.', 403);
const notFoundResponse     = errorResponse('Resource not found.', 404);
const validationResponse   = errorResponse('Validation error.', 422);

/* ── Reusable component schemas ───────────────────────────────────────────── */

const paginationMeta: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    total:       { type: 'integer', example: 42 },
    page:        { type: 'integer', example: 1 },
    limit:       { type: 'integer', example: 10 },
    totalPages:  { type: 'integer', example: 5 },
    hasNextPage: { type: 'boolean', example: true },
    hasPrevPage: { type: 'boolean', example: false },
  },
};

const userSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id:        { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
    name:      { type: 'string', example: 'Alice Smith' },
    email:     { type: 'string', format: 'email', example: 'alice@example.com' },
    role:      { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const taskMemberSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id:    { type: 'string', format: 'uuid' },
    name:  { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
};

const taskSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id:          { type: 'string', format: 'uuid' },
    title:       { type: 'string', example: 'Design landing page' },
    description: { type: 'string', nullable: true },
    status:      { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], example: 'TODO' },
    priority:    { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'MEDIUM' },
    dueDate:     { type: 'string', format: 'date-time', nullable: true },
    assignedTo:  { type: 'string', format: 'uuid' },
    createdBy:   { type: 'string', format: 'uuid' },
    assignee:    taskMemberSchema,
    creator:     taskMemberSchema,
    createdAt:   { type: 'string', format: 'date-time' },
    updatedAt:   { type: 'string', format: 'date-time' },
  },
};

/* ── Spec ─────────────────────────────────────────────────────────────────── */

const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description:
      'REST API for the Express Task Management application.\n\n' +
      '**Authentication:** All protected endpoints require a `Bearer <token>` header.\n' +
      'Obtain a token from `POST /auth/signin` or `POST /auth/signup`.',
    contact: { name: 'API Support' },
  },
  servers: [
    { url: '/api/v1', description: 'Current server' },
  ],
  tags: [
    { name: 'Health',  description: 'Server liveness probe' },
    { name: 'Auth',    description: 'Authentication & account management' },
    { name: 'Tasks',   description: 'Task CRUD operations' },
    { name: 'Users',   description: 'Admin user management' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter the JWT returned by /auth/signin or /auth/signup.',
      },
    },
    schemas: {
      User: userSchema,
      Task: taskSchema,
      TaskMember: taskMemberSchema,
      PaginationMeta: paginationMeta,
    },
  },
  paths: {
    /* ── Health ──────────────────────────────────────────────────────────── */
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe',
        description: 'Returns 200 when the server is running.',
        operationId: 'getHealth',
        responses: {
          200: successResponse('Server is healthy.', {
            type: 'object',
            properties: {
              status:  { type: 'string', example: 'OK' },
              timestamp: { type: 'string', format: 'date-time' },
              uptime:  { type: 'string', example: '3600s' },
            },
          }),
        },
      },
    },

    /* ── Auth ────────────────────────────────────────────────────────────── */
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        operationId: 'signup',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name:     { type: 'string', minLength: 2, maxLength: 100, example: 'Alice Smith' },
                  email:    { type: 'string', format: 'email', example: 'alice@example.com' },
                  password: { type: 'string', minLength: 8, maxLength: 72, example: 'Secret123' },
                },
              },
            },
          },
        },
        responses: {
          201: successResponse('Account created.', {
            type: 'object',
            properties: {
              user:  { $ref: '#/components/schemas/User' },
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
          }),
          409: errorResponse('Email already in use.', 409),
          422: validationResponse,
        },
      },
    },

    '/auth/signin': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in and receive a JWT',
        operationId: 'signin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', format: 'email', example: 'alice@example.com' },
                  password: { type: 'string', example: 'Secret123' },
                },
              },
            },
          },
        },
        responses: {
          200: successResponse('Signed in.', {
            type: 'object',
            properties: {
              user:  { $ref: '#/components/schemas/User' },
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
          }),
          401: errorResponse('Invalid credentials.', 401),
          422: validationResponse,
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (stateless — discard the JWT client-side)',
        operationId: 'logout',
        security: [{ BearerAuth: [] }],
        responses: {
          200: successResponse('Signed out.'),
          401: unauthorizedResponse,
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        operationId: 'getMe',
        security: [{ BearerAuth: [] }],
        responses: {
          200: successResponse('Profile retrieved.', {
            type: 'object',
            properties: { user: { $ref: '#/components/schemas/User' } },
          }),
          401: unauthorizedResponse,
        },
      },
      patch: {
        tags: ['Auth'],
        summary: 'Update current user name / email',
        operationId: 'updateProfile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
                properties: {
                  name:  { type: 'string', minLength: 2, maxLength: 100, example: 'Alice Smith' },
                  email: { type: 'string', format: 'email', example: 'newemail@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: successResponse('Profile updated.', {
            type: 'object',
            properties: { user: { $ref: '#/components/schemas/User' } },
          }),
          401: unauthorizedResponse,
          409: errorResponse('Email already in use.', 409),
          422: validationResponse,
        },
      },
    },

    '/auth/me/password': {
      patch: {
        tags: ['Auth'],
        summary: 'Change password',
        operationId: 'changePassword',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', example: 'OldSecret123' },
                  newPassword:     { type: 'string', minLength: 8, maxLength: 72, example: 'NewSecret456' },
                },
              },
            },
          },
        },
        responses: {
          200: successResponse('Password changed.'),
          400: errorResponse('Current password is incorrect.', 400),
          401: unauthorizedResponse,
          422: validationResponse,
        },
      },
    },

    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password-reset email',
        description:
          'Always returns 200 regardless of whether the email exists, to prevent user enumeration.',
        operationId: 'forgotPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'alice@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: successResponse('If that email exists, a reset link has been sent.'),
          422: validationResponse,
        },
      },
    },

    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Set a new password using the reset token',
        operationId: 'resetPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token:       { type: 'string', description: 'Token from the reset-link URL param', example: 'abc123...' },
                  newPassword: { type: 'string', minLength: 8, maxLength: 72, example: 'NewSecret456' },
                },
              },
            },
          },
        },
        responses: {
          200: successResponse('Password reset successfully.'),
          400: errorResponse('Token is invalid or has expired.', 400),
          422: validationResponse,
        },
      },
    },

    /* ── Tasks ───────────────────────────────────────────────────────────── */
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks (admin sees all; member sees assigned only)',
        operationId: 'getTasks',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
        ],
        responses: {
          200: successResponse('Tasks retrieved.', {
            type: 'object',
            properties: {
              tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
              meta:  { $ref: '#/components/schemas/PaginationMeta' },
            },
          }),
          401: unauthorizedResponse,
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task (admin only)',
        operationId: 'createTask',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'assignedTo'],
                properties: {
                  title:       { type: 'string', maxLength: 200, example: 'Design landing page' },
                  description: { type: 'string', maxLength: 2000 },
                  assignedTo:  { type: 'string', format: 'uuid' },
                  status:      { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' },
                  priority:    { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
                  dueDate:     { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: successResponse('Task created.', {
            type: 'object',
            properties: { task: { $ref: '#/components/schemas/Task' } },
          }),
          401: unauthorizedResponse,
          403: forbiddenResponse,
          422: validationResponse,
        },
      },
    },

    '/tasks/members': {
      get: {
        tags: ['Tasks'],
        summary: 'List all members (for assign dropdown)',
        operationId: 'getMembers',
        security: [{ BearerAuth: [] }],
        responses: {
          200: successResponse('Members retrieved.', {
            type: 'object',
            properties: {
              members: { type: 'array', items: { $ref: '#/components/schemas/TaskMember' } },
            },
          }),
          401: unauthorizedResponse,
        },
      },
    },

    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get a task by ID',
        operationId: 'getTaskById',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: successResponse('Task retrieved.', {
            type: 'object',
            properties: { task: { $ref: '#/components/schemas/Task' } },
          }),
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update a task (admin only)',
        operationId: 'updateTask',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title:       { type: 'string', maxLength: 200 },
                  description: { type: 'string', maxLength: 2000 },
                  assignedTo:  { type: 'string', format: 'uuid' },
                  status:      { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
                  priority:    { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
                  dueDate:     { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          200: successResponse('Task updated.', {
            type: 'object',
            properties: { task: { $ref: '#/components/schemas/Task' } },
          }),
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
          422: validationResponse,
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task (admin only)',
        operationId: 'deleteTask',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: successResponse('Task deleted.'),
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
    },

    /* ── Users ───────────────────────────────────────────────────────────── */
    '/users/stats': {
      get: {
        tags: ['Users'],
        summary: 'Get aggregate dashboard stats (admin only)',
        operationId: 'getStats',
        security: [{ BearerAuth: [] }],
        responses: {
          200: successResponse('Stats retrieved.', {
            type: 'object',
            properties: {
              stats: {
                type: 'object',
                properties: {
                  totalUsers:   { type: 'integer', example: 25 },
                  totalAdmins:  { type: 'integer', example: 3 },
                  totalMembers: { type: 'integer', example: 22 },
                  totalTasks:   { type: 'integer', example: 120 },
                },
              },
            },
          }),
          401: unauthorizedResponse,
          403: forbiddenResponse,
        },
      },
    },

    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Paginated list of all users (admin only)',
        operationId: 'getUsers',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
        ],
        responses: {
          200: successResponse('Users retrieved.', {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
                  allOf: [
                    { $ref: '#/components/schemas/User' },
                    { type: 'object', properties: { noOfTask: { type: 'integer', example: 5 } } },
                  ],
                },
              },
              meta: { $ref: '#/components/schemas/PaginationMeta' },
            },
          }),
          401: unauthorizedResponse,
          403: forbiddenResponse,
        },
      },
    },

    '/users/{id}': {
      patch: {
        tags: ['Users'],
        summary: 'Update a user (admin only)',
        operationId: 'updateUser',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name:  { type: 'string', minLength: 2, maxLength: 100 },
                  email: { type: 'string', format: 'email' },
                  role:  { type: 'string', enum: ['USER', 'ADMIN'] },
                },
              },
            },
          },
        },
        responses: {
          200: successResponse('User updated.', {
            type: 'object',
            properties: { user: { $ref: '#/components/schemas/User' } },
          }),
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
          422: validationResponse,
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user (admin only)',
        operationId: 'deleteUser',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: successResponse('User deleted.'),
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
    },
  },
};

export default swaggerSpec;
