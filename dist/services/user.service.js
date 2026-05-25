"use strict";
/**
 * File: src/services/user.service.ts
 * Purpose: User management business logic (admin only).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.deleteUser = exports.updateUser = exports.getUsers = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const prisma_2 = require("../generated/prisma");
const getUsers = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [rawUsers, total] = await Promise.all([
        prisma_1.default.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { assignedTasks: true } } },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma_1.default.user.count(),
    ]);
    const users = rawUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        noOfTask: u._count.assignedTasks,
        createdAt: u.createdAt,
    }));
    const totalPages = Math.ceil(total / limit);
    return {
        users,
        meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
};
exports.getUsers = getUsers;
const updateUser = async (id, data) => {
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user)
        throw Object.assign(new Error('User not found.'), { statusCode: 404 });
    const updated = await prisma_1.default.user.update({
        where: { id },
        data: {
            ...(data.name ? { name: data.name } : {}),
            ...(data.email ? { email: data.email.toLowerCase() } : {}),
            ...(data.role ? { role: data.role } : {}),
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return updated;
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user)
        throw Object.assign(new Error('User not found.'), { statusCode: 404 });
    await prisma_1.default.user.delete({ where: { id } });
};
exports.deleteUser = deleteUser;
const getStats = async () => {
    const [totalUsers, totalAdmins, totalTasks] = await Promise.all([
        prisma_1.default.user.count(),
        prisma_1.default.user.count({ where: { role: prisma_2.Role.ADMIN } }),
        prisma_1.default.task.count(),
    ]);
    return {
        totalUsers,
        totalAdmins,
        totalMembers: totalUsers - totalAdmins,
        totalTasks,
    };
};
exports.getStats = getStats;
//# sourceMappingURL=user.service.js.map