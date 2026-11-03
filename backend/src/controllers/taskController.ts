import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/taskService.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  objectIdSchema
} from '../validators/taskValidator.js';

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = taskQuerySchema.parse(req.query);
    const userId = req.user!.id;

    const result = await taskService.getTasks(userId, query);

    res.status(200).json({
      success: true,
      tasks: result.tasks,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const userId = req.user!.id;

    const task = await taskService.createTask(userId, validatedData);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = objectIdSchema.parse(req.params.id);
    const userId = req.user!.id;

    const task = await taskService.getTaskById(userId, taskId);

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = objectIdSchema.parse(req.params.id);
    const validatedData = updateTaskSchema.parse(req.body);
    const userId = req.user!.id;

    const task = await taskService.updateTask(userId, taskId, validatedData);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = objectIdSchema.parse(req.params.id);
    const userId = req.user!.id;

    await taskService.deleteTask(userId, taskId);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
