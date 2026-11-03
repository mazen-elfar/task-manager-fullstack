import { Types, FilterQuery } from 'mongoose';
import { Task, ITaskDocument } from '../models/Task.js';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../validators/taskValidator.js';
import { NotFoundError } from '../utils/errors.js';

export interface TaskListResult {
  tasks: Array<Record<string, unknown>>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class TaskService {
  /**
   * List all tasks belonging to the authenticated user with search, filtering, and pagination
   */
  public async getTasks(userId: string, query: TaskQueryInput): Promise<TaskListResult> {
    const filter: FilterQuery<ITaskDocument> = {
      userId: new Types.ObjectId(userId)
    };

    // Filter by status if not 'all'
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    // Filter by priority if not 'all'
    if (query.priority && query.priority !== 'all') {
      filter.priority = query.priority;
    }

    // Substring search across title and description
    if (query.search) {
      const searchRegex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sortField = query.sortBy || 'createdAt';

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      Task.countDocuments(filter)
    ]);

    return {
      tasks: tasks.map((t) => t.toJSON()),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * Create a new task strictly owned by the authenticated user
   */
  public async createTask(userId: string, input: CreateTaskInput): Promise<Record<string, unknown>> {
    const task = await Task.create({
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
      userId: new Types.ObjectId(userId)
    });

    return task.toJSON();
  }

  /**
   * Get a task by ID ensuring it belongs to the authenticated user
   */
  public async getTaskById(userId: string, taskId: string): Promise<Record<string, unknown>> {
    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId)
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task.toJSON();
  }

  /**
   * Update an existing task strictly owned by the authenticated user
   */
  public async updateTask(
    userId: string,
    taskId: string,
    input: UpdateTaskInput
  ): Promise<Record<string, unknown>> {
    const task = await Task.findOneAndUpdate(
      {
        _id: new Types.ObjectId(taskId),
        userId: new Types.ObjectId(userId)
      },
      { $set: input },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task.toJSON();
  }

  /**
   * Delete an existing task strictly owned by the authenticated user
   */
  public async deleteTask(userId: string, taskId: string): Promise<{ id: string }> {
    const task = await Task.findOneAndDelete({
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId)
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return { id: taskId };
  }
}

export const taskService = new TaskService();
