"use strict";
/**
 * File: src/services/task.service.ts
 * Purpose: Task CRUD business logic.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMembers = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const error_middleware_1 = require("../middlewares/error.middleware");
const client_js_1 = require("../generated/prisma/client.js");
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
};
const getTasks = async (userId, role, page, limit) => {
    const where = role === client_js_1.Role.ADMIN ? {} : { assignedTo: userId };
    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
        prisma_1.default.task.findMany({
            where,
            select: taskSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma_1.default.task.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        tasks: tasks,
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
exports.getTasks = getTasks;
const getTaskById = async (id, userId, role) => {
    const task = await prisma_1.default.task.findUnique({ where: { id }, select: taskSelect });
    if (!task)
        throw new error_middleware_1.AppError('Task not found.', 404);
    if (role !== client_js_1.Role.ADMIN && task.assignedTo !== userId) {
        throw new error_middleware_1.AppError('You do not have access to this task.', 403);
    }
    return task;
};
exports.getTaskById = getTaskById;
const createTask = async (data, adminId) => {
    const assignee = await prisma_1.default.user.findUnique({ where: { id: data.assignedTo } });
    if (!assignee)
        throw new error_middleware_1.AppError('Assigned user not found.', 404);
    const task = await prisma_1.default.task.create({
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
exports.createTask = createTask;
const updateTask = async (id, data) => {
    const existing = await prisma_1.default.task.findUnique({ where: { id } });
    if (!existing)
        throw new error_middleware_1.AppError('Task not found.', 404);
    if (data.assignedTo) {
        const assignee = await prisma_1.default.user.findUnique({ where: { id: data.assignedTo } });
        if (!assignee)
            throw new error_middleware_1.AppError('Assigned user not found.', 404);
    }
    const task = await prisma_1.default.task.update({
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
exports.updateTask = updateTask;
const deleteTask = async (id) => {
    const existing = await prisma_1.default.task.findUnique({ where: { id } });
    if (!existing)
        throw new error_middleware_1.AppError('Task not found.', 404);
    await prisma_1.default.task.delete({ where: { id } });
};
exports.deleteTask = deleteTask;
const getMembers = async () => {
    return prisma_1.default.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
    });
};
exports.getMembers = getMembers;
//# sourceMappingURL=task.service.js.map