/**
 * File: src/routes/user.route.ts
 * Purpose: User management routes (admin only).
 */

import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../generated/prisma';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN));

/* GET /users/stats — aggregate counts for the admin dashboard */
router.get('/stats', userController.getStats);

/* GET /users — paginated list of all users */
router.get('/', userController.getUsers);

/* PATCH /users/:id — update a user */
router.patch('/:id', userController.updateUser);

/* DELETE /users/:id — delete a user */
router.delete('/:id', userController.deleteUser);

export default router;
