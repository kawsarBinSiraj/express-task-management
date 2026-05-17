import api from "./api";
import type { UserListResponse, DashboardStats, UpdateUserInput } from "@/types";

export const userService = {
   getUsers: async (page = 1, limit = 10): Promise<UserListResponse> => {
      const { data } = await api.get<{ data: UserListResponse }>(`/users?page=${page}&limit=${limit}`);
      return data.data;
   },

   getStats: async (): Promise<DashboardStats> => {
      const { data } = await api.get<{ data: { stats: DashboardStats } }>('/users/stats');
      return data.data.stats;
   },

   updateUser: async (id: string, input: UpdateUserInput) => {
      const { data } = await api.patch<{ data: { user: any } }>(`/users/${id}`, input);
      return data.data.user;
   },

   deleteUser: async (id: string): Promise<void> => {
      await api.delete(`/users/${id}`);
   },
};
