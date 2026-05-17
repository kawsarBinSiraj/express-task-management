/**
 * File: src/interfaces/task.interface.ts
 * Purpose: Shared task-related type definitions.
 */

import { TaskStatus, TaskPriority } from '../generated/prisma/client.js';

export { TaskStatus, TaskPriority };

export interface ICreateTaskInput {
  title: string;
  description?: string;
  assignedTo: string;   // assignee user id
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;     // ISO date string from client
}

export interface IUpdateTaskInput {
  title?: string;
  description?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface ITaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  assignedTo: string;
  createdBy: string;
  assignee: { id: string; name: string; email: string };
  creator: { id: string; name: string; email: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ITaskListResponse {
  tasks: ITaskResponse[];
  meta: IPaginationMeta;
}
