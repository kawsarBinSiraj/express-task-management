/**
 * File: src/services/task.service.ts
 * Purpose: Task CRUD business logic.
 */

import prisma from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { Role } from '../generated/prisma/client.js';
import { ICreateTaskInput, IUpdateTaskInput, ITaskListResponse, ITaskResponse } from '../interfaces/task.interface';

const taskSelect = {
   id: true,
   title: true,
   description: true,
   status: true,
   priority: true,
   dueDate: true,
   assignedTo: true,
   createdBy: true,
   assignee: { select: { id: true, name: true, email: true } },
   creator: { select: { id: true, name: true, email: true } },
   createdAt: true,
   updatedAt: true,
} as const;

export const getTasks = async (userId: string, role: Role, page: number, limit: number): Promise<ITaskListResponse> => {
   const where = role === Role.ADMIN ? {} : { assignedTo: userId };
   const skip = (page - 1) * limit;

   const [tasks, total] = await Promise.all([
      prisma.task.findMany({
         where,
         select: taskSelect,
         orderBy: { createdAt: 'desc' },
         skip,
         take: limit,
      }),
      prisma.task.count({ where }),
   ]);

   const totalPages = Math.ceil(total / limit);

   return {
      tasks: tasks as ITaskResponse[],
      meta: {
         total,
         page,
         limit,
         totalPages,
         hasNextPage: page < totalPages,
         hasPrevPage: page > 1,
      },
   };
};

export const getTaskById = async (id: string, userId: string, role: Role): Promise<ITaskResponse> => {
   const task = await prisma.task.findUnique({ where: { id }, select: taskSelect });

   if (!task) throw new AppError('Task not found.', 404);

   if (role !== Role.ADMIN && task.assignedTo !== userId) {
      throw new AppError('You do not have access to this task.', 403);
   }

   return task;
};

export const createTask = async (data: ICreateTaskInput, adminId: string): Promise<ITaskResponse> => {
   const assignee = await prisma.user.findUnique({ where: { id: data.assignedTo } });
   if (!assignee) throw new AppError('Assigned user not found.', 404);

   const task = await prisma.task.create({
      data: {
         title: data.title,
         description: data.description,
         status: data.status,
         priority: data.priority,
         dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
         createdBy: adminId,
         assignedTo: data.assignedTo,
      },
      select: taskSelect,
   });

   return task;
};

export const updateTask = async (id: string, data: IUpdateTaskInput): Promise<ITaskResponse> => {
   const existing = await prisma.task.findUnique({ where: { id } });
   if (!existing) throw new AppError('Task not found.', 404);

   if (data.assignedTo) {
      const assignee = await prisma.user.findUnique({ where: { id: data.assignedTo } });
      if (!assignee) throw new AppError('Assigned user not found.', 404);
   }

   const task = await prisma.task.update({
      where: { id },
      data: {
         ...(data.title && { title: data.title }),
         ...(data.description !== undefined && { description: data.description }),
         ...(data.status && { status: data.status }),
         ...(data.priority && { priority: data.priority }),
         ...(data.assignedTo && { assignedTo: data.assignedTo }),
         ...(data.dueDate !== undefined && {
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
         }),
      },
      select: taskSelect,
   });

   return task;
};

export const deleteTask = async (id: string): Promise<void> => {
   const existing = await prisma.task.findUnique({ where: { id } });
   if (!existing) throw new AppError('Task not found.', 404);
   await prisma.task.delete({ where: { id } });
};

export const getMembers = async () => {
   return prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
   });
};
