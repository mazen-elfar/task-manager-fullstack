import React from 'react';
import { Search, X, Plus, Filter } from 'lucide-react';
import { Button } from '../common/Button';
import { TaskPriority, TaskStatus } from '../../types/task';
import { cn } from '@/lib/utils';

export interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | TaskStatus;
  onStatusChange: (status: 'all' | TaskStatus) => void;
  priorityFilter: 'all' | TaskPriority;
  onPriorityChange: (priority: 'all' | TaskPriority) => void;
  onResetFilters: () => void;
  onCreateTask: () => void;
  isFiltered: boolean;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  onResetFilters,
  onCreateTask,
  isFiltered
}) => {
  return (
    <div className="flex flex-col gap-3.5 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title or details..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-9 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Create Task Button */}
        <Button
          size="md"
          onClick={onCreateTask}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Create Task
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Status Tabs */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200/60">
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(status)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-md transition-all select-none',
                  statusFilter === status
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Priority Dropdown */}
          <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value as 'all' | TaskPriority)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
