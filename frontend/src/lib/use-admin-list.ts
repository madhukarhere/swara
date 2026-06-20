'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiJson } from './client-api';

export interface ListMeta {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

/**
 * Data layer for admin list screens: server-side search (q), pagination, and
 * arbitrary filters (e.g. status). Out-of-order responses are ignored. Call
 * `reload()` after a create/update/delete to refresh the current page.
 */
export function useAdminList<T>(endpoint: string, limit = 12) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<ListMeta>({ page: 1, pages: 1, total: 0, limit });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPageState] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  const reqId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.set('q', q);
    for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);
    const r = await apiJson<{ data: T[]; meta?: ListMeta }>(`${endpoint}?${params.toString()}`);
    if (id !== reqId.current) return;
    if (r.ok) {
      setItems(r.body.data ?? []);
      if (r.body.meta) setMeta(r.body.meta);
      setResponse(r.body as Record<string, unknown>);
    }
    setLoading(false);
  }, [endpoint, limit, page, q, filters]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    items,
    meta,
    loading,
    q,
    page,
    filters,
    response,
    search: (value: string) => {
      setQ(value);
      setPageState(1);
    },
    setPage: setPageState,
    setFilter: (key: string, value: string) => {
      setFilters((f) => ({ ...f, [key]: value }));
      setPageState(1);
    },
    reload,
  };
}
