export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskQueryParams {
  search?: string;
  status?: 'all' | TaskStatus;
  priority?: 'all' | TaskPriority;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'dueDate' | 'title' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskListResponse {
  success: boolean;
  tasks: Task[];
  pagination: TaskPagination;
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  task: Task;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}
