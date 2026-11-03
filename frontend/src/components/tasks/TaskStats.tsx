import React from 'react';
import { Card } from '../common/Card';
import { CheckSquare, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export interface TaskStatsProps {
  total: number;
  pending: number;
  completed: number;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ total, pending, completed }) => {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Tasks */}
      <Card className="p-4 flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
          <CheckSquare className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{total}</div>
        </div>
      </Card>

      {/* Pending Tasks */}
      <Card className="p-4 flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{pending}</div>
        </div>
      </Card>

      {/* Completed Tasks */}
      <Card className="p-4 flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{completed}</div>
        </div>
      </Card>

      {/* Completion Rate */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Progress</span>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{completionRate}%</span>
          </div>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </Card>
    </div>
  );
};
