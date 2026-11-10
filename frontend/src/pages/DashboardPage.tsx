import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/common/Toast';
import { AppLayout } from '../components/layout/AppLayout';
import { TaskStats } from '../components/tasks/TaskStats';
import { TaskFilterBar } from '../components/tasks/TaskFilterBar';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskEmptyState } from '../components/tasks/TaskEmptyState';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { TaskDeleteDialog } from '../components/tasks/TaskDeleteDialog';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { taskService } from '../services/taskService';
import { Task, TaskPriority, TaskStatus, CreateTaskPayload } from '../types/task';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import axios from 'axios';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');

  // Debounce search input by 300ms to eliminate network thrashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Modal dialog states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Fetch tasks from API with race condition and debounce protection
  const loadTasks = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await taskService.getTasks({
        search: debouncedSearch || undefined,
        status: statusFilter,
        priority: priorityFilter,
        limit: 100
      }, signal);
      setTasks(data.tasks);
    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        return; // Stale request aborted; do not overwrite state
      }
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to load tasks. Please check your connection.';
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    const controller = new AbortController();
    loadTasks(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadTasks]);

  // Compute Task Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  // Handlers for Task CRUD
  const handleCreateOrUpdate = async (payload: CreateTaskPayload) => {
    try {
      if (editingTask) {
        const updated = await taskService.updateTask(editingTask.id, payload);
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        success('Task updated successfully', 'Saved');
      } else {
        const created = await taskService.createTask(payload);
        setTasks((prev) => [created, ...prev]);
        success('New task added to workspace', 'Created');
      }
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to save task. Please try again.';
      toastError(msg, 'Error');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    setUpdatingTaskId(task.id);

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await taskService.updateTask(task.id, { status: nextStatus });
      success(
        nextStatus === 'completed' ? 'Task marked as completed' : 'Task reopened as pending',
        'Status Updated'
      );
    } catch (err: unknown) {
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      toastError('Could not update task status', 'Error');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(deletingTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      success('Task permanently removed', 'Deleted');
      setIsDeleteDialogOpen(false);
      setDeletingTask(null);
    } catch (err: unknown) {
      toastError('Failed to delete task', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const isFiltered = Boolean(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all');

  return (
    <AppLayout
      userName={user?.name}
      userEmail={user?.email}
      onLogout={logout}
      taskCounts={stats}
      activeFilter={statusFilter}
      onSelectFilter={(f) => setStatusFilter(f)}
    >
      <div className="max-w-6xl mx-auto pb-12">
        {/* Welcome Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Task Workspace</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
                <Sparkles className="w-3 h-3" />
                Live Constellation
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage, organize, and prioritize your daily deliverables with interactive reactive dynamics.
            </p>
          </div>
        </div>

        {/* Task Overview Stats */}
        <TaskStats total={stats.total} pending={stats.pending} completed={stats.completed} />

        {/* Search & Filters */}
        <TaskFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onResetFilters={handleResetFilters}
          onCreateTask={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          isFiltered={isFiltered}
        />

        {/* Content Area */}
        {fetchError ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center border-rose-500/30 bg-rose-500/10">
            <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
            <h3 className="text-base font-bold text-white">Failed to load tasks</h3>
            <p className="text-sm text-rose-300 mt-1 max-w-md">{fetchError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadTasks()}
              className="mt-4"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry
            </Button>
          </Card>
        ) : isLoading && tasks.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-slate-900/40 backdrop-blur-sm animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <TaskEmptyState
            isFiltering={isFiltered}
            onClearFilters={handleResetFilters}
            onCreateTask={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsFormOpen(true);
                }}
                onDelete={(t) => {
                  setDeletingTask(t);
                  setIsDeleteDialogOpen(true);
                }}
                isUpdatingStatus={updatingTaskId === task.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal (Create & Edit) */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdate}
        task={editingTask}
      />

      {/* Task Delete Confirmation Dialog */}
      <TaskDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={handleDeleteTask}
        task={deletingTask}
        isDeleting={isDeleting}
      />
    </AppLayout>
  );
};
