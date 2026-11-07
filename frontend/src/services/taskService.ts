import { apiClient } from './api';
import {
  Task,
  TaskListResponse,
  TaskResponse,
  TaskQueryParams,
  CreateTaskPayload,
  UpdateTaskPayload
} from '../types/task';

export const taskService = {
  async getTasks(params?: TaskQueryParams, signal?: AbortSignal): Promise<TaskListResponse> {
    const response = await apiClient.get<TaskListResponse>('/tasks', {
      params,
      signal
    });
    return response.data;
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await apiClient.post<TaskResponse>('/tasks', payload);
    return response.data.task;
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await apiClient.get<TaskResponse>(`/tasks/${id}`);
    return response.data.task;
  },

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const response = await apiClient.patch<TaskResponse>(`/tasks/${id}`, payload);
    return response.data.task;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  }
};
