import mongoose, { Schema, type Document, type Model, Types } from 'mongoose';

export type CardPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ICard {
  boardId: Types.ObjectId;
  columnId: Types.ObjectId;
  title: string;
  description?: any;
  order: number;
  priority: CardPriority;
  tags: string[];
  assignees: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICardDocument extends ICard, Document {}

const CardSchema = new Schema<ICardDocument>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
      minlength: [1, 'Card title cannot be empty'],
      maxlength: [200, 'Card title cannot exceed 200 characters'],
    },
    description: {
      type: Schema.Types.Mixed,
      default: '',
    },
    order: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        ret.boardId = ret.boardId?.toString();
        ret.columnId = ret.columnId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for fast queries of cards by board and column ordered by position
CardSchema.index({ boardId: 1, columnId: 1, order: 1 });

export const Card: Model<ICardDocument> =
  mongoose.models.Card || mongoose.model<ICardDocument>('Card', CardSchema);
