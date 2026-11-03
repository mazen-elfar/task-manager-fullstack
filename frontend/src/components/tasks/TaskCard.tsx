import React from 'react';
import { Task } from '../../types/task';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Check, Calendar, Edit2, Trash2, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

export interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isUpdatingStatus?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isUpdatingStatus = false
}) => {
  const isCompleted = task.status === 'completed';

  const formattedDueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue =
    formattedDueDate && !isCompleted && isPast(formattedDueDate) && !isToday(formattedDueDate);

  return (
    <Card
      hoverable
      className={cn(
        'p-5 transition-all duration-200 border-l-4 group',
        isCompleted
          ? 'border-l-emerald-500 bg-slate-50/50 opacity-80'
          : task.priority === 'high'
          ? 'border-l-rose-500'
          : task.priority === 'medium'
          ? 'border-l-indigo-500'
          : 'border-l-sky-500'
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion checkbox button */}
        <button
          type="button"
          disabled={isUpdatingStatus}
          onClick={() => onToggleStatus(task)}
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
            isCompleted
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
              : 'border-slate-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/40 text-transparent'
          )}
          aria-label={isCompleted ? `Mark ${task.title} as pending` : `Mark ${task.title} as completed`}
        >
          <Check className={cn('w-4 h-4 transition-transform', isCompleted && 'scale-100')} />
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={cn(
                'text-base font-semibold text-slate-900 transition-colors break-words',
                isCompleted && 'line-through text-slate-400'
              )}
            >
              {task.title}
            </h3>

            {/* Actions Menu */}
            <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`Edit ${task.title}`}
                title="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`Delete ${task.title}`}
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={cn(
                'text-sm text-slate-600 mt-1 line-clamp-3 break-words',
                isCompleted && 'text-slate-400'
              )}
            >
              {task.description}
            </p>
          )}

          {/* Badges & Metadata */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-slate-100/80">
            <Badge variant={task.status}>{task.status === 'completed' ? 'Completed' : 'Pending'}</Badge>
            <Badge variant={task.priority}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>

            {formattedDueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md',
                  isOverdue
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-slate-100 text-slate-600'
                )}
                title={isOverdue ? 'Task is overdue' : 'Due date'}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Due {format(formattedDueDate, 'MMM d, yyyy')}</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs text-slate-400 ml-auto">
              <Clock className="w-3 h-3" />
              <span>{format(new Date(task.createdAt), 'MMM d')}</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
