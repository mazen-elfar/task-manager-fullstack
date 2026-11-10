import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task, TaskPriority, TaskStatus, CreateTaskPayload } from '../../types/task';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  status: z.enum(['pending', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional()
});

type TaskFormData = z.infer<typeof taskFormSchema>;

export interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskPayload) => Promise<void>;
  task?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task
}) => {
  const isEditing = Boolean(task);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: ''
    }
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: ''
      });
    }
  }, [task, reset, isOpen]);

  const handleFormSubmit = async (data: TaskFormData) => {
    await onSubmit({
      title: data.title,
      description: data.description || '',
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description={
        isEditing
          ? 'Update the details or status of your task below.'
          : 'Add a new task to your workspace with priority and due date.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
        <Input
          label="Title"
          placeholder="e.g. Prepare presentation slides"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="space-y-1.5">
          <label htmlFor="task-description" className="block text-sm font-medium text-slate-200">
            Description
          </label>
          <textarea
            id="task-description"
            rows={3}
            placeholder="Add any relevant details, sub-tasks, or notes..."
            className="block w-full rounded-xl border border-white/15 bg-slate-950/60 backdrop-blur-sm px-3.5 py-2.5 text-sm text-slate-100 transition-all placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 resize-y"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-rose-400 font-medium">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Priority */}
          <div className="space-y-1.5">
            <label htmlFor="task-priority" className="block text-sm font-medium text-slate-200">
              Priority
            </label>
            <select
              id="task-priority"
              className="block w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 cursor-pointer"
              {...register('priority')}
            >
              <option value="low" className="bg-slate-900 text-slate-100">Low</option>
              <option value="medium" className="bg-slate-900 text-slate-100">Medium</option>
              <option value="high" className="bg-slate-900 text-slate-100">High</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label htmlFor="task-status" className="block text-sm font-medium text-slate-200">
              Status
            </label>
            <select
              id="task-status"
              className="block w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 cursor-pointer"
              {...register('status')}
            >
              <option value="pending" className="bg-slate-900 text-slate-100">Pending</option>
              <option value="completed" className="bg-slate-900 text-slate-100">Completed</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label htmlFor="task-due-date" className="block text-sm font-medium text-slate-200">
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              className="block w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 cursor-pointer [color-scheme:dark]"
              {...register('dueDate')}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
