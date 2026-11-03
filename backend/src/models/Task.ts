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

// Compound indexes for user-scoped filtering, searching and ordering
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

export const Task: ITaskModel = mongoose.model<ITaskDocument, ITaskModel>('Task', taskSchema);
