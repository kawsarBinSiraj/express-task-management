/**
 * File: src/services/user.service.ts
 * Purpose: User management business logic (admin only).
 */

import prisma from '../config/prisma';
import { Role } from '../generated/prisma';
import { IPaginationMeta } from '../interfaces/task.interface';

export interface IUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  noOfTask: number;
  createdAt: Date;
}

export interface IUserListResponse {
  users: IUserItem[];
  meta: IPaginationMeta;
}

export const getUsers = async (page: number, limit: number): Promise<IUserListResponse> => {
  const skip = (page - 1) * limit;

  const [rawUsers, total] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { assignedTasks: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  const users: IUserItem[] = rawUsers.map((u) => ({
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

export interface IUpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
}

export const updateUser = async (id: string, data: IUpdateUserInput) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 });

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.email ? { email: data.email.toLowerCase() } : {}),
      ...(data.role ? { role: data.role as Role } : {}),
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return updated;
};

export const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  await prisma.user.delete({ where: { id } });
};

export interface IAdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalMembers: number;
  totalTasks: number;
}

export const getStats = async (): Promise<IAdminStats> => {
  const [totalUsers, totalAdmins, totalTasks] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.task.count(),
  ]);

  return {
    totalUsers,
    totalAdmins,
    totalMembers: totalUsers - totalAdmins,
    totalTasks,
  };
};
