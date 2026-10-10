import mongoose, { Schema, type Document, type Model, Types } from 'mongoose';

export interface IBoardColumn {
  _id: Types.ObjectId;
  title: string;
  order: number;
}

export interface IBoardMember {
  userId: Types.ObjectId;
  role: 'editor' | 'viewer';
}

export interface IBoard {
  title: string;
  ownerId: Types.ObjectId;
  members: IBoardMember[];
  columns: IBoardColumn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBoardDocument extends IBoard, Document {}

const BoardColumnSchema = new Schema<IBoardColumn>(
  {
    title: {
      type: String,
      required: [true, 'Column title is required'],
      trim: true,
      maxlength: [50, 'Column title cannot exceed 50 characters'],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

const BoardMemberSchema = new Schema<IBoardMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'editor',
    },
  },
  { _id: false }
);

const BoardSchema = new Schema<IBoardDocument>(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      minlength: [2, 'Board title must be at least 2 characters'],
      maxlength: [100, 'Board title cannot exceed 100 characters'],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [BoardMemberSchema],
    columns: [BoardColumnSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        if (Array.isArray(ret.columns)) {
          ret.columns = ret.columns.map((c: any) => ({
            id: c._id ? c._id.toString() : c.id,
            title: c.title,
            order: c.order,
          }));
        }
        return ret;
      },
    },
  }
);

export const Board: Model<IBoardDocument> =
  mongoose.models.Board || mongoose.model<IBoardDocument>('Board', BoardSchema);
