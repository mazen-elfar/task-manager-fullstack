import React from 'react';
import { Task } from '../../types/task';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Check, Calendar, Edit2, Trash2, AlertCircle } from 'lucide-react';
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
        'p-5 transition-all duration-300 border-l-4 group relative',
        isCompleted
          ? 'border-l-emerald-500 bg-slate-900/40 opacity-75'
          : task.priority === 'high'
          ? 'border-l-rose-500 shadow-[inset_2px_0_12px_rgba(244,63,94,0.15)]'
          : task.priority === 'medium'
          ? 'border-l-indigo-400 shadow-[inset_2px_0_12px_rgba(129,140,248,0.15)]'
          : 'border-l-sky-400 shadow-[inset_2px_0_12px_rgba(56,189,248,0.15)]'
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion checkbox button */}
        <button
          type="button"
          disabled={isUpdatingStatus}
          onClick={() => onToggleStatus(task)}
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 focus:ring-offset-slate-900',
            isCompleted
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
              : 'border-white/20 bg-white/5 hover:border-cyan-400 hover:bg-cyan-500/10 text-transparent'
          )}
          aria-label={isCompleted ? `Mark ${task.title} as pending` : `Mark ${task.title} as completed`}
        >
          <Check className={cn('w-4 h-4 transition-transform duration-200', isCompleted ? 'scale-100' : 'scale-0')} />
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={cn(
                'text-base font-bold text-white transition-colors break-words',
                isCompleted && 'line-through text-slate-400 font-normal'
              )}
            >
              {task.title}
            </h3>

            {/* Actions Menu */}
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label={`Edit ${task.title}`}
                title="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
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
                'text-sm text-slate-300 mt-1.5 line-clamp-3 break-words leading-relaxed',
                isCompleted && 'text-slate-400'
              )}
            >
              {task.description}
            </p>
          )}

          {/* Badges and Metadata */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {/* Priority Badge */}
            <Badge variant={task.priority} size="sm">
              <span className="capitalize">{task.priority} Priority</span>
            </Badge>

            {/* Status Badge */}
            <Badge variant={task.status} size="sm">
              <span className="capitalize">{task.status}</span>
            </Badge>

            {/* Due Date Indicator */}
            {formattedDueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border select-none backdrop-blur-sm',
                  isOverdue
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse'
                    : 'bg-white/5 text-slate-300 border-white/10'
                )}
                title={isOverdue ? 'This task is past its due date' : 'Due date'}
              >
                {isOverdue ? <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> : <Calendar className="w-3.5 h-3.5 text-slate-400" />}
                <span>
                  {isToday(formattedDueDate) ? 'Today' : format(formattedDueDate, 'MMM d, yyyy')}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
