export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coverUrl?: string | null;
  order?: number;
  isVisible?: boolean;
  songCount?: number;
}

export interface Song {
  id: string;
  title: string;
  slug: string;
  category: Category | string | null;
  singer?: string | null;
  composer?: string | null;
  lyricist?: string | null;
  duration?: number | null;
  coverUrl?: string | null;
  audioUrl?: string | null;
  hasAudio: boolean;
  playCount: number;
  downloadCount: number;
  isFeatured: boolean;
  languages: string[];
  tags: string[];
  status?: string;
  createdAt?: string | null;
}

export interface Lyrics {
  id: string;
  language: string;
  languageCode: string;
  script?: string | null;
  content: string;
  isDefault: boolean;
  order: number;
}

export interface SongDetail extends Song {
  lyrics: Lyrics[];
  related: Song[];
}

export interface Comment {
  id: string;
  name: string;
  rating?: number | null;
  comment: string;
  createdAt?: string | null;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface HomepageData {
  sections: { key: string; title: string; enabled: boolean; order: number }[];
  heroSlides: { title: string; subtitle?: string | null; image: string; link?: string | null }[];
  announcements: { id: string; message: string; link?: string | null }[];
  banner: { id: string; festivalKey: string; title: string; subtitle?: string | null; image: string; link?: string | null } | null;
  devotionPanel?: {
    enabled: boolean;
    left: { image: string | null; title: string; caption: string };
    right: { image: string | null; title: string; caption: string };
  };
  today: { iso: string; weekday: string; dateLabel: string; festival: { name: string; festivalKey?: string | null; description?: string | null } | null };
  quote: { text: string; author?: string | null; language?: string | null } | null;
  top5: Song[];
  featured: Song[];
  recentlyAdded: Song[];
  mostPlayed: Song[];
  categories: Category[];
  featuredVideos: { id: string; title: string; slug: string; thumbnail?: string | null; externalUrl?: string | null }[];
  latestArticles: { id: string; title: string; slug: string; excerpt?: string | null; coverUrl?: string | null; publishedAt?: string | null }[];
  upcomingEvents: { id: string; title: string; slug: string; startDate: string; location?: string | null }[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  author?: string | null;
  tags: string[];
  status?: string;
  publishedAt?: string | null;
  createdAt?: string | null;
}

export interface ArticleDetail extends Article {
  body: string;
}

export interface QuoteItem {
  id: string;
  text: string;
  author?: string | null;
  language?: string | null;
  featured?: boolean;
}

export function categoryName(c: Category | string | null): string {
  if (!c) return '';
  return typeof c === 'string' ? '' : c.name;
}
export function categorySlug(c: Category | string | null): string {
  if (!c) return '';
  return typeof c === 'string' ? '' : c.slug;
}
