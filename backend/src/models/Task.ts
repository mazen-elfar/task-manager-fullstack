import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask, Document {}

export interface ITaskModel extends Model<ITaskDocument> {}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: 'Status must be either pending or completed'
      },
      default: 'pending',
      index: true
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high'
      },
      default: 'medium'
    },
    dueDate: {
      type: Date,
      default: null
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as Types.ObjectId).toString();
        ret.userId = (ret.userId as Types.ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes tailored for user-scoped query patterns, sorting, and filtering
// 1. User + status + newest first (primary dashboard view)
taskSchema.index({ userId: 1, status: 1, createdAt: -1 });

// 2. User + priority + newest first (priority filtered view)
taskSchema.index({ userId: 1, priority: 1, createdAt: -1 });

// 3. User + dueDate (due date ascending sort without in-memory sort buffer overflow)
taskSchema.index({ userId: 1, dueDate: 1 });

// 4. User + default chronological sort
taskSchema.index({ userId: 1, createdAt: -1 });

// 5. Full-text search index on title and description
taskSchema.index({ title: 'text', description: 'text' });

export const Task: ITaskModel = mongoose.model<ITaskDocument, ITaskModel>('Task', taskSchema);
