import { z } from 'zod';
import mongoose from 'mongoose';

export const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid task identifier format'
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .default(''),
  status: z.enum(['pending', 'completed']).optional().default('pending'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .or(z.date())
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : null))
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  status: z.enum(['pending', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .or(z.date())
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : null))
});

export const taskQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['all', 'pending', 'completed']).optional().default('all'),
  priority: z.enum(['all', 'low', 'medium', 'high']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  sortBy: z.enum(['createdAt', 'dueDate', 'title', 'priority']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
