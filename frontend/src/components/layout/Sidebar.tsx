import React from 'react';
import { CheckSquare, Clock, CheckCircle2, ListFilter, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  taskCounts?: {
    total: number;
    pending: number;
    completed: number;
  };
  activeFilter?: string;
  onSelectFilter?: (filter: 'all' | 'pending' | 'completed') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  taskCounts = { total: 0, pending: 0, completed: 0 },
  activeFilter = 'all',
  onSelectFilter
}) => {
  const filterItems = [
    {
      id: 'all',
      label: 'All Tasks',
      icon: <ListFilter className="w-4 h-4" />,
      count: taskCounts.total,
      color: 'text-cyan-400'
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: <Clock className="w-4 h-4" />,
      count: taskCounts.pending,
      color: 'text-amber-400'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: <CheckCircle2 className="w-4 h-4" />,
      count: taskCounts.completed,
      color: 'text-emerald-400'
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b1220]/80 backdrop-blur-2xl border-r border-white/10 p-4 text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]">
            <CheckSquare className="w-4 h-4" />
          </div>
          <span className="font-bold text-white tracking-tight">TaskMaster</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="py-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3">
          Views & Filters
        </span>
        <nav className="mt-2 space-y-1">
          {filterItems.map((item) => {
            const isActive = activeFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectFilter?.(item.id as 'all' | 'pending' | 'completed');
                  onClose();
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-left',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.12)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={item.color}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full border',
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-400 border-white/5'
                  )}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Ambient System & Intelligence Panel */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-3.5 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <span>Reactive Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Real-time particle dynamics with mouse repel and impulse physics active.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>All systems nominal</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 h-[calc(100vh-5rem)] rounded-2xl overflow-hidden my-4 border border-white/10 shadow-2xl">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
