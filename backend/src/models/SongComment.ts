import { Schema, model, type Document, type Types } from 'mongoose';

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface ISongComment extends Document {
  _id: Types.ObjectId;
  song: Types.ObjectId;
  name: string;
  email?: string;
  rating?: number;
  comment: string;
  status: CommentStatus;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const songCommentSchema = new Schema<ISongComment>(
  {
    song: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, trim: true, lowercase: true, maxlength: 160 },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    ipHash: { type: String },
  },
  { timestamps: true },
);

songCommentSchema.index({ song: 1, status: 1, createdAt: -1 });

export const SongComment = model<ISongComment>('SongComment', songCommentSchema, 'songComments');
