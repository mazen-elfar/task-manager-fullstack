import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFilterBar } from '../TaskFilterBar';

describe('TaskFilterBar Component', () => {
  it('calls onSearchChange when user types in search input', async () => {
    const onSearchChange = vi.fn();
    render(
      <TaskFilterBar
        searchQuery=""
        onSearchChange={onSearchChange}
        statusFilter="all"
        onStatusChange={vi.fn()}
        priorityFilter="all"
        onPriorityChange={vi.fn()}
        onResetFilters={vi.fn()}
        onCreateTask={vi.fn()}
        isFiltered={false}
      />
    );

    const input = screen.getByPlaceholderText(/Search tasks by title or details/i);
    await userEvent.type(input, 'test');

    expect(onSearchChange).toHaveBeenCalled();
  });

  it('triggers onStatusChange when status filter button clicked', async () => {
    const onStatusChange = vi.fn();
    render(
      <TaskFilterBar
        searchQuery=""
        onSearchChange={vi.fn()}
        statusFilter="all"
        onStatusChange={onStatusChange}
        priorityFilter="all"
        onPriorityChange={vi.fn()}
        onResetFilters={vi.fn()}
        onCreateTask={vi.fn()}
        isFiltered={false}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Completed' }));
    expect(onStatusChange).toHaveBeenCalledWith('completed');
  });

  it('calls onCreateTask when Create Task button is clicked', async () => {
    const onCreateTask = vi.fn();
    render(
      <TaskFilterBar
        searchQuery=""
        onSearchChange={vi.fn()}
        statusFilter="all"
        onStatusChange={vi.fn()}
        priorityFilter="all"
        onPriorityChange={vi.fn()}
        onResetFilters={vi.fn()}
        onCreateTask={onCreateTask}
        isFiltered={false}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /Create Task/i }));
    expect(onCreateTask).toHaveBeenCalledTimes(1);
  });
});
