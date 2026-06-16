import { Schema, model, type Document, type Types } from 'mongoose';

/* ------------------------------- Video ------------------------------- */
export interface IVideo extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  videoFile?: string;
  externalUrl?: string;
  thumbnail?: string;
  category?: string;
  duration?: number;
  isFeatured: boolean;
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    videoFile: { type: String },
    externalUrl: { type: String, trim: true },
    thumbnail: { type: String },
    category: { type: String, trim: true },
    duration: { type: Number, min: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);
videoSchema.index({ title: 'text', description: 'text' });

export const Video = model<IVideo>('Video', videoSchema, 'videos');

/* ----------------------------- Document ------------------------------ */
export interface IDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  type: string;
  filePath: string;
  mime?: string;
  size?: number;
  linkedSong?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, default: 'general', trim: true },
    filePath: { type: String, required: true },
    mime: { type: String },
    size: { type: Number },
    linkedSong: { type: Schema.Types.ObjectId, ref: 'Song' },
  },
  { timestamps: true },
);

export const DocumentModel = model<IDocument>('Document', documentSchema, 'documents');

/* ------------------------------ Article ------------------------------ */
export interface IArticle extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  coverImage?: string;
  author?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true },
    body: { type: String, required: true },
    coverImage: { type: String },
    author: { type: String, trim: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);
articleSchema.index({ title: 'text', excerpt: 'text', body: 'text' });

export const Article = model<IArticle>('Article', articleSchema, 'articles');

/* ------------------------------- Event ------------------------------- */
export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  banner?: string;
  link?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    location: { type: String, trim: true },
    banner: { type: String },
    link: { type: String, trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
  },
  { timestamps: true },
);

export const EventModel = model<IEvent>('Event', eventSchema, 'events');
