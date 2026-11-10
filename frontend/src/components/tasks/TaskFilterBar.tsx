import React from 'react';
import { Search, X, Plus, Filter, RotateCcw } from 'lucide-react';
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
            className="w-full rounded-xl border border-white/15 bg-slate-900/70 backdrop-blur-xl pl-10 pr-9 py-2.5 text-sm text-slate-100 transition-all placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
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
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl bg-slate-900/80 backdrop-blur-sm p-1 border border-white/10 shadow-sm">
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(status)}
                className={cn(
                  'px-3.5 py-1 text-xs font-semibold rounded-lg transition-all select-none',
                  statusFilter === status
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Priority Dropdown */}
          <div className="inline-flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-1.5 text-xs shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value as 'all' | TaskPriority)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-100">All Priorities</option>
              <option value="low" className="bg-slate-900 text-slate-100">Low Priority</option>
              <option value="medium" className="bg-slate-900 text-slate-100">Medium Priority</option>
              <option value="high" className="bg-slate-900 text-slate-100">High Priority</option>
            </select>
          </div>
        </div>

        {/* Reset Filters Option if filters are active */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
