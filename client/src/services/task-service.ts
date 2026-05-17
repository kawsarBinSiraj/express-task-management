import api from "./api";
import type { TaskListResponse, Task, CreateTaskInput, TaskMember } from "@/types";

export const taskService = {
   getTasks: async (page = 1, limit = 10): Promise<TaskListResponse> => {
      const { data } = await api.get<{ data: TaskListResponse }>(`/tasks?page=${page}&limit=${limit}`);
      return data.data;
   },

   getTaskById: async (id: string): Promise<Task> => {
      const { data } = await api.get<{ data: { task: Task } }>(`/tasks/${id}`);
      return data.data.task;
   },

   createTask: async (input: CreateTaskInput): Promise<Task> => {
      const { data } = await api.post<{ data: { task: Task } }>("/tasks", input);
      return data.data.task;
   },

   updateTask: async (id: string, input: Partial<CreateTaskInput>): Promise<Task> => {
      const { data } = await api.put<{ data: { task: Task } }>(`/tasks/${id}`, input);
      return data.data.task;
   },

   deleteTask: async (id: string): Promise<void> => {
      await api.delete(`/tasks/${id}`);
   },

   getMembers: async (): Promise<TaskMember[]> => {
      const { data } = await api.get<{ data: { members: TaskMember[] } }>("/tasks/members");
      return data.data.members;
   },
};
