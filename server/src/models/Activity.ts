import mongoose, { Schema, type Document, type Model, Types } from 'mongoose';

export type ActivityType = 'comment' | 'system_log';

export interface IActivity {
  cardId: Types.ObjectId;
  userId?: Types.ObjectId;
  userName: string;
  userAvatarColor: string;
  type: ActivityType;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityDocument extends IActivity, Document {}

const ActivitySchema = new Schema<IActivityDocument>(
  {
    cardId: {
      type: Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userAvatarColor: {
      type: String,
      default: '#06b6d4',
    },
    type: {
      type: String,
      enum: ['comment', 'system_log'],
      default: 'comment',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Activity content is required'],
      trim: true,
      maxlength: [1000, 'Content cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        ret.cardId = ret.cardId?.toString();
        if (ret.userId) ret.userId = ret.userId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for chronological retrieval per card
ActivitySchema.index({ cardId: 1, createdAt: -1 });

export const Activity: Model<IActivityDocument> =
  mongoose.models.Activity || mongoose.model<IActivityDocument>('Activity', ActivitySchema);
