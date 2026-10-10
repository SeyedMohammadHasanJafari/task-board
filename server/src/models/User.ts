import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IUser {
  name: string;
  email?: string;
  passwordHash?: string;
  avatarColor: string;
  isGuest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  toSafeUser(): ISafeUser;
}

export interface ISafeUser {
  id: string;
  name: string;
  email?: string;
  avatarColor: string;
  isGuest: boolean;
  createdAt: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        'Please enter a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      select: false, // Hidden by default from queries for security
    },
    avatarColor: {
      type: String,
      default: '#06b6d4',
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Method to safely export user profile without sensitive fields
UserSchema.methods.toSafeUser = function (this: IUserDocument): ISafeUser {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatarColor: this.avatarColor,
    isGuest: this.isGuest,
    createdAt: this.createdAt.toISOString(),
  };
};

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
