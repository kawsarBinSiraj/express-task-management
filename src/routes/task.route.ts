/**
 * File: src/routes/task.route.ts
 * Purpose: Task CRUD routes with role-based access.
 */

import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createTaskSchema, updateTaskSchema } from '../validations/task.validation';
import { Role } from '../generated/prisma';

const router = Router();

/* All task routes require authentication. */
router.use(authenticate);

/* GET /tasks/members — all authenticated users can fetch member list for the assign dropdown */
router.get('/members', taskController.getMembers);

/* GET /tasks — admin sees all, member sees only assigned */
router.get('/', taskController.getTasks);

/* GET /tasks/:id — admin or assigned member */
router.get('/:id', taskController.getTaskById);

/* Admin-only mutations */
router.post('/', authorize(Role.ADMIN), validateRequest(createTaskSchema), taskController.createTask);
router.put('/:id', authorize(Role.ADMIN), validateRequest(updateTaskSchema), taskController.updateTask);
router.delete('/:id', authorize(Role.ADMIN), taskController.deleteTask);

export default router;
