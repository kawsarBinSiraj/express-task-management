/**
 * File: src/controllers/task.controller.ts
 * Purpose: HTTP handlers for task endpoints.
 */

import { Request, Response } from 'express';
import * as taskService from '../services/task.service';
import { sendSuccess } from '../utils/response';
import catchAsync from '../utils/catchAsync';
import { Role } from '../generated/prisma/client.js';

export const getTasks = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const result = await taskService.getTasks(req.user!.id, req.user!.role as Role, page, limit);
  sendSuccess(res, 200, 'Tasks retrieved successfully.', result);
});

export const getTaskById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const task = await taskService.getTaskById(id, req.user!.id, req.user!.role as Role);
  sendSuccess(res, 200, 'Task retrieved successfully.', { task });
});

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.body, req.user!.id);
  sendSuccess(res, 201, 'Task created successfully.', { task });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const task = await taskService.updateTask(id, req.body);
  sendSuccess(res, 200, 'Task updated successfully.', { task });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await taskService.deleteTask(id);
  sendSuccess(res, 200, 'Task deleted successfully.', null);
});

export const getMembers = catchAsync(async (_req: Request, res: Response) => {
  const members = await taskService.getMembers();
  sendSuccess(res, 200, 'Members retrieved successfully.', { members });
});
