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
      <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-white/15">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">No matching tasks found</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1.5 mb-6 leading-relaxed">
          No tasks match your current search and filter criteria. Try adjusting your search query or reset active filters.
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
    <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-white/15">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(56,189,248,0.25)]">
        <ClipboardList className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight">No tasks created yet</h3>
      <p className="text-sm text-slate-400 max-w-md mt-1.5 mb-6 leading-relaxed">
        Your workspace is clear and ready. Organize your deliverables, configure priorities, and interact with live particle dynamics.
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
