import { Schema, model, type Document, type Types } from 'mongoose';

/* ------------------------------- Quote ------------------------------- */
export interface IQuote extends Document {
  _id: Types.ObjectId;
  text: string;
  author?: string;
  language?: string;
  mode: 'random' | 'featured';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quoteSchema = new Schema<IQuote>(
  {
    text: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    language: { type: String, trim: true },
    mode: { type: String, enum: ['random', 'featured'], default: 'random', index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Quote = model<IQuote>('Quote', quoteSchema, 'quotes');

/* ------------------------------ Banner ------------------------------- */
export const FESTIVAL_KEYS = [
  'independence_day',
  'republic_day',
  'guru_purnima',
  'rama_navami',
  'krishna_janmashtami',
  'diwali',
  'sankranti',
  'ugadi',
  'generic',
] as const;
export type FestivalKey = (typeof FESTIVAL_KEYS)[number];

export interface IBanner extends Document {
  _id: Types.ObjectId;
  festivalKey: FestivalKey;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    festivalKey: { type: String, enum: FESTIVAL_KEYS, default: 'generic' },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    image: { type: String, required: true },
    link: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
bannerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

export const Banner = model<IBanner>('Banner', bannerSchema, 'banners');

/* --------------------------- Announcement ---------------------------- */
export interface IAnnouncement extends Document {
  _id: Types.ObjectId;
  message: string;
  link?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    message: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
announcementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

export const Announcement = model<IAnnouncement>('Announcement', announcementSchema, 'announcements');

/* --------------------------- CalendarEvent --------------------------- */
export interface ICalendarEvent extends Document {
  _id: Types.ObjectId;
  name: string;
  festivalKey?: string;
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
  /** null/absent = recurs every year */
  year?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const calendarEventSchema = new Schema<ICalendarEvent>(
  {
    name: { type: String, required: true, trim: true },
    festivalKey: { type: String, trim: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    day: { type: Number, required: true, min: 1, max: 31 },
    year: { type: Number },
    description: { type: String, trim: true },
  },
  { timestamps: true },
);
calendarEventSchema.index({ month: 1, day: 1 });

export const CalendarEvent = model<ICalendarEvent>('CalendarEvent', calendarEventSchema, 'calendarEvents');

/* -------------------------- HomepageSettings ------------------------- */
export interface IHomepageSection {
  key: string;
  title: string;
  enabled: boolean;
  order: number;
  config?: Record<string, unknown>;
}

export interface IHeroSlide {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
}

export interface IHomepageSettings extends Document {
  _id: Types.ObjectId;
  singleton: 'singleton';
  sections: IHomepageSection[];
  heroSlides: IHeroSlide[];
  recentlyAddedMode: 'auto' | 'manual';
  recentlyAddedSongs: Types.ObjectId[];
  mostPlayedMode: 'auto' | 'manual';
  mostPlayedSongs: Types.ObjectId[];
  top5Songs: Types.ObjectId[];
  featuredSongs: Types.ObjectId[];
  quoteMode: 'random' | 'manual';
  manualQuote?: Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const heroSlideSchema = new Schema<IHeroSlide>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
  },
  { _id: false },
);

const sectionSchema = new Schema<IHomepageSection>(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    config: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const homepageSettingsSchema = new Schema<IHomepageSettings>(
  {
    singleton: { type: String, default: 'singleton', enum: ['singleton'], unique: true },
    sections: { type: [sectionSchema], default: [] },
    heroSlides: { type: [heroSlideSchema], default: [] },
    recentlyAddedMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    recentlyAddedSongs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    mostPlayedMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    mostPlayedSongs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    top5Songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    featuredSongs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    quoteMode: { type: String, enum: ['random', 'manual'], default: 'random' },
    manualQuote: { type: Schema.Types.ObjectId, ref: 'Quote' },
  },
  { timestamps: true },
);

export const HomepageSettings = model<IHomepageSettings>(
  'HomepageSettings',
  homepageSettingsSchema,
  'homepageSettings',
);
