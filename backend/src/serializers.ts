import { publicUrl } from './lib/storage';

/* These accept lean documents or hydrated docs; fields are read defensively. */

interface CategoryLike {
  _id: unknown;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  order?: number;
}

export function serializeCategory(c: CategoryLike) {
  return {
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    coverUrl: c.coverImage ? publicUrl('images', c.coverImage) : null,
    order: c.order ?? 0,
  };
}

interface SongLike {
  _id: unknown;
  title: string;
  slug: string;
  category?: unknown;
  singer?: string;
  composer?: string;
  lyricist?: string;
  duration?: number;
  audioFile?: string;
  coverImage?: string;
  playCount?: number;
  downloadCount?: number;
  isFeatured?: boolean;
  isTop5?: boolean;
  top5Order?: number;
  languages?: string[];
  tags?: string[];
  status?: string;
  createdAt?: Date;
  publishedAt?: Date;
}

function categoryField(category: unknown) {
  if (category && typeof category === 'object' && 'name' in (category as Record<string, unknown>)) {
    return serializeCategory(category as CategoryLike);
  }
  return category ? String(category) : null;
}

export function serializeSong(s: SongLike) {
  return {
    id: String(s._id),
    title: s.title,
    slug: s.slug,
    category: categoryField(s.category),
    singer: s.singer ?? null,
    composer: s.composer ?? null,
    lyricist: s.lyricist ?? null,
    duration: s.duration ?? null,
    coverUrl: s.coverImage ? publicUrl('images', s.coverImage) : null,
    audioUrl: s.audioFile ? `/api/songs/${String(s._id)}/stream` : null,
    hasAudio: Boolean(s.audioFile),
    playCount: s.playCount ?? 0,
    downloadCount: s.downloadCount ?? 0,
    isFeatured: Boolean(s.isFeatured),
    languages: s.languages ?? [],
    tags: s.tags ?? [],
    status: s.status ?? 'published',
    createdAt: s.createdAt ?? null,
    publishedAt: s.publishedAt ?? null,
  };
}

interface LyricsLike {
  _id: unknown;
  language: string;
  languageCode: string;
  script?: string;
  content: string;
  isDefault?: boolean;
  order?: number;
}

export function serializeLyrics(l: LyricsLike) {
  return {
    id: String(l._id),
    language: l.language,
    languageCode: l.languageCode,
    script: l.script ?? null,
    content: l.content,
    isDefault: Boolean(l.isDefault),
    order: l.order ?? 0,
  };
}

interface CommentLike {
  _id: unknown;
  name: string;
  email?: string;
  rating?: number;
  comment: string;
  status: string;
  createdAt?: Date;
}

export function serializeComment(c: CommentLike) {
  return {
    id: String(c._id),
    name: c.name,
    rating: c.rating ?? null,
    comment: c.comment,
    createdAt: c.createdAt ?? null,
  };
}

export function serializeCommentAdmin(c: CommentLike & { song?: unknown }) {
  return {
    ...serializeComment(c),
    email: c.email ?? null,
    status: c.status,
    song: c.song && typeof c.song === 'object' ? serializeSong(c.song as SongLike) : c.song ? String(c.song) : null,
  };
}
