import { Schema, model, type Document, type Types } from 'mongoose';

export interface ISong extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  category: Types.ObjectId;
  singer?: string;
  composer?: string;
  lyricist?: string;
  /** duration in seconds */
  duration?: number;
  /** filename stored under data/songs */
  audioFile?: string;
  /** filename stored under data/images */
  coverImage?: string;
  playCount: number;
  downloadCount: number;
  isFeatured: boolean;
  isTop5: boolean;
  top5Order: number;
  /** denormalized list of available lyric language names, for quick display/filter */
  languages: string[];
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const songSchema = new Schema<ISong>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    singer: { type: String, trim: true },
    composer: { type: String, trim: true },
    lyricist: { type: String, trim: true },
    duration: { type: Number, min: 0 },
    audioFile: { type: String },
    coverImage: { type: String },
    playCount: { type: Number, default: 0, index: true },
    downloadCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isTop5: { type: Boolean, default: false },
    top5Order: { type: Number, default: 0 },
    languages: { type: [String], default: [] },
    tags: { type: [String], default: [], index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

// Full-text search across song metadata (lyrics text is indexed on SongLyrics).
songSchema.index({ title: 'text', singer: 'text', composer: 'text', lyricist: 'text', tags: 'text' });
songSchema.index({ status: 1, createdAt: -1 });
songSchema.index({ status: 1, playCount: -1 });

export const Song = model<ISong>('Song', songSchema, 'songs');
