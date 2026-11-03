import React from 'react';
import { Task } from '../../types/task';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';

export interface TaskDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  task?: Task | null;
  isDeleting?: boolean;
}

export const TaskDeleteDialog: React.FC<TaskDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task,
  isDeleting = false
}) => {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Task"
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={isDeleting} onClick={onConfirm}>
            Delete Task
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-semibold text-slate-900">"{task.title}"</span>?
          </p>
          <p className="text-xs text-slate-500 mt-2">
            This action cannot be undone. The task will be permanently removed from your workspace.
          </p>
        </div>
      </div>
    </Modal>
  );
};
