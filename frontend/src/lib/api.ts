import type { HomepageData, Paginated, Song, SongDetail, Category, Article, ArticleDetail, QuoteItem } from './types';

// Server-side base URL (SSR/RSC). Browser requests use relative paths via the Next proxy.
const INTERNAL = process.env.API_INTERNAL_URL || 'http://localhost:4000';

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${INTERNAL}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export function getHomepage(): Promise<HomepageData> {
  return apiGet<HomepageData>('/api/homepage');
}

export function getSongs(query = ''): Promise<Paginated<Song>> {
  return apiGet<Paginated<Song>>(`/api/songs${query}`);
}

export async function getSong(slug: string): Promise<SongDetail | null> {
  try {
    return await apiGet<SongDetail>(`/api/songs/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export function getCategories(): Promise<{ data: Category[] }> {
  return apiGet<{ data: Category[] }>('/api/categories');
}

export function getArticles(query = ''): Promise<Paginated<Article>> {
  return apiGet<Paginated<Article>>(`/api/articles${query}`);
}

export async function getArticle(slug: string): Promise<ArticleDetail | null> {
  try {
    return await apiGet<ArticleDetail>(`/api/articles/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export function getQuotes(): Promise<{ data: QuoteItem[] }> {
  return apiGet<{ data: QuoteItem[] }>('/api/quotes');
}
