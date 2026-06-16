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

export function paginate<T>(data: T[], total: number, page: number, limit: number): Paginated<T> {
  return {
    data,
    meta: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) },
  };
}
