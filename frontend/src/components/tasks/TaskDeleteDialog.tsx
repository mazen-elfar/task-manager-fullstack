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
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-slate-200 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-white">"{task.title}"</span>?
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            This action cannot be undone. The task will be permanently removed from your workspace constellation.
          </p>
        </div>
      </div>
    </Modal>
  );
};
