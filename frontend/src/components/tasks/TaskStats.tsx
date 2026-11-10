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
      <Card hoverable className="p-4 flex items-center gap-3.5 group">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-[0_0_15px_rgba(56,189,248,0.15)] group-hover:scale-105 transition-transform">
          <CheckSquare className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</div>
          <div className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">{total}</div>
        </div>
      </Card>

      {/* Pending Tasks */}
      <Card hoverable className="p-4 flex items-center gap-3.5 group">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:scale-105 transition-transform">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending</div>
          <div className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">{pending}</div>
        </div>
      </Card>

      {/* Completed Tasks */}
      <Card hoverable className="p-4 flex items-center gap-3.5 group">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</div>
          <div className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">{completed}</div>
        </div>
      </Card>

      {/* Completion Rate */}
      <Card hoverable className="p-4 flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Progress</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{completionRate}%</span>
          </div>
        </div>
        <div className="mt-3 w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </Card>
    </div>
  );
};
