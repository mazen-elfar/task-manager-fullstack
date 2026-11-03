import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../TaskCard';
import { Task } from '../../../types/task';

const mockTask: Task = {
  id: 'task-101',
  title: 'Implement unit testing',
  description: 'Write frontend and backend tests',
  status: 'pending',
  priority: 'high',
  dueDate: '2026-12-31T00:00:00.000Z',
  userId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('TaskCard Component', () => {
  it('renders task details and badges correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Implement unit testing')).toBeInTheDocument();
    expect(screen.getByText('Write frontend and backend tests')).toBeInTheDocument();
    expect(screen.getByText(/High Priority/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });

  it('calls onToggleStatus when checkbox is clicked', async () => {
    const onToggleStatus = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={onToggleStatus}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /Mark Implement unit testing as completed/i });
    await userEvent.click(toggleButton);

    expect(onToggleStatus).toHaveBeenCalledTimes(1);
    expect(onToggleStatus).toHaveBeenCalledWith(mockTask);
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    const editBtn = screen.getByRole('button', { name: /Edit Implement unit testing/i });
    await userEvent.click(editBtn);

    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /Delete Implement unit testing/i });
    await userEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(mockTask);
  });
});
