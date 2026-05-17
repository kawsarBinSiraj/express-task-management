/**
 * File: src/controllers/user.controller.ts
 * Purpose: HTTP handlers for user management endpoints.
 */

import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess } from '../utils/response';
import catchAsync from '../utils/catchAsync';

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const result = await userService.getUsers(page, limit);
  sendSuccess(res, 200, 'Users retrieved successfully.', result);
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await userService.updateUser(id, req.body);
  sendSuccess(res, 200, 'User updated successfully.', { user });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await userService.deleteUser(id);
  sendSuccess(res, 200, 'User deleted successfully.', null);
});

export const getStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await userService.getStats();
  sendSuccess(res, 200, 'Stats retrieved successfully.', { stats });
});
