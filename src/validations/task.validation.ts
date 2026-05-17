/**
 * File: src/validations/task.validation.ts
 * Purpose: Zod schemas for task request validation.
 */

import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .nonempty('Title is required.')
    .max(200, 'Title must not exceed 200 characters.'),

  description: z.string().trim().max(2000).optional(),

  assignedTo: z.string().uuid('Invalid assignee ID.'),

  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),

  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),

  dueDate: z.string().datetime({ offset: true }).optional().or(z.literal('')).transform((v) => v || undefined),
});

export const updateTaskSchema = createTaskSchema.partial();
