"use strict";
/**
 * File: src/validations/task.validation.ts
 * Purpose: Zod schemas for task request validation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .trim()
        .nonempty('Title is required.')
        .max(200, 'Title must not exceed 200 characters.'),
    description: zod_1.z.string().trim().max(2000).optional(),
    assignedTo: zod_1.z.string().uuid('Invalid assignee ID.'),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.literal('')).transform((v) => v || undefined),
});
exports.updateTaskSchema = exports.createTaskSchema.partial();
//# sourceMappingURL=task.validation.js.map