'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/** Debounced search input for admin list screens. */
export function AdminSearch({ onSearch, placeholder = 'Search…' }: { onSearch: (q: string) => void; placeholder?: string }) {
  const [v, setV] = useState('');
  const cb = useRef(onSearch);
  cb.current = onSearch;
  useEffect(() => {
    const t = setTimeout(() => cb.current(v.trim()), 300);
    return () => clearTimeout(t);
  }, [v]);
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="pl-10" aria-label="Search" />
    </div>
  );
}

/** Prev / page / Next pager. Renders the total even on a single page. */
export function AdminPager({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <span className="text-sm text-muted-foreground">
        {total} total
      </span>
      {pages > 1 ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            ← Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            Next →
          </Button>
        </div>
      ) : null}
    </div>
  );
}
