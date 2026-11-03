import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ClipboardList, SearchX, Plus, RotateCcw } from 'lucide-react';

export interface TaskEmptyStateProps {
  isFiltering?: boolean;
  onClearFilters?: () => void;
  onCreateTask?: () => void;
}

export const TaskEmptyState: React.FC<TaskEmptyStateProps> = ({
  isFiltering = false,
  onClearFilters,
  onCreateTask
}) => {
  if (isFiltering) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No matching tasks found</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">
          No tasks match your current search and filter criteria. Try adjusting keywords or resetting filters.
        </p>
        {onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset Filters
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-12 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-4">
        <ClipboardList className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">No tasks created yet</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">
        Organize your work, set priorities, and track your progress all in one place.
      </p>
      {onCreateTask && (
        <Button
          size="md"
          onClick={onCreateTask}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create First Task
        </Button>
      )}
    </Card>
  );
};
