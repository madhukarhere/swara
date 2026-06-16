import { Schema, model, type Document, type Types } from 'mongoose';

export interface ISongLyrics extends Document {
  _id: Types.ObjectId;
  song: Types.ObjectId;
  /** Display name, e.g. "Telugu", "English", "Roman Transliteration" */
  language: string;
  /** Short code, e.g. "te", "en", "sa", "hi", "roman" */
  languageCode: string;
  /** Optional script label */
  script?: string;
  content: string;
  isDefault: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const songLyricsSchema = new Schema<ISongLyrics>(
  {
    song: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
    language: { type: String, required: true, trim: true },
    languageCode: { type: String, required: true, trim: true, lowercase: true },
    script: { type: String, trim: true },
    content: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One translation per (song, languageCode). Unlimited languages per song.
songLyricsSchema.index({ song: 1, languageCode: 1 }, { unique: true });
songLyricsSchema.index({ song: 1, order: 1 });
// NB: no text index here — a field named `language` collides with MongoDB's
// text language_override (e.g. "Telugu" is rejected). Lyrics search uses regex,
// which also handles Unicode/Indic substrings better than text stemming.

export const SongLyrics = model<ISongLyrics>('SongLyrics', songLyricsSchema, 'songLyrics');
