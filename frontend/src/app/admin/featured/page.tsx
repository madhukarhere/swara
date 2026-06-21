'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Trophy } from 'lucide-react';
import { apiJson } from '@/lib/client-api';
import { useAdminList } from '@/lib/use-admin-list';
import { AdminSearch, AdminPager } from '@/components/admin/list-controls';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { categoryName, type Category } from '@/lib/types';
import { cn, formatNumber } from '@/lib/utils';
import { iconForKey } from '@/components/icons/cultural-icons';

interface AdminSong {
  id: string;
  title: string;
  slug: string;
  category: Category | string | null;
  singer?: string | null;
  coverUrl?: string | null;
  status?: string;
  playCount: number;
  isFeatured: boolean;
  isTop5: boolean;
}

const TABS = [
  { key: 'all', label: 'All songs' },
  { key: 'featured', label: 'Featured' },
  { key: 'top5', label: 'Top 5' },
] as const;

export default function AdminFeaturedPage() {
  const { items, meta, loading, response, search, setPage, setFilter, filters, reload } = useAdminList<AdminSong>(
    '/api/admin/songs',
    15,
  );
  const placement = (filters.placement as string) ?? 'all';
  const counts = (response?.counts as { featured: number; top5: number }) ?? { featured: 0, top5: 0 };
  const [busy, setBusy] = useState<string | null>(null);

  const toggle = async (s: AdminSong, field: 'isFeatured' | 'isTop5') => {
    setBusy(s.id + field);
    const r = await apiJson(`/api/admin/songs/${s.id}/flags`, 'PATCH', { [field]: !s[field] });
    setBusy(null);
    if (r.ok) void reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Featured Songs</h1>
        <p className="text-muted-foreground">
          Choose which songs appear in the <b>Featured</b> and <b>Top 5</b> sections on the homepage.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter('placement', t.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                placement === t.key ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              {t.key === 'featured' ? <Badge variant="muted" className="ml-1.5">{counts.featured}</Badge> : null}
              {t.key === 'top5' ? <Badge variant="muted" className="ml-1.5">{counts.top5}/5</Badge> : null}
            </button>
          ))}
        </div>
        <AdminSearch onSearch={search} placeholder="Search songs…" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No songs found.</p>
      ) : (
        <>
          <Card>
            <CardContent className="divide-y p-2">
              {items.map((s) => {
                const Ic = iconForKey(s.id);
                return (
                  <div key={s.id} className="flex flex-wrap items-center gap-3 p-2">
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {s.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Ic className="h-5 w-5 text-primary/40" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/songs/${s.id}`} className="truncate font-medium hover:text-primary">
                          {s.title}
                        </Link>
                        {s.status === 'draft' ? <Badge variant="warning">draft</Badge> : null}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {categoryName(s.category) || s.singer || '—'} · {formatNumber(s.playCount)} plays
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <TogglePill active={s.isFeatured} busy={busy === s.id + 'isFeatured'} onClick={() => toggle(s, 'isFeatured')} icon={Star} label="Featured" />
                      <TogglePill active={s.isTop5} busy={busy === s.id + 'isTop5'} onClick={() => toggle(s, 'isTop5')} icon={Trophy} label="Top 5" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <AdminPager page={meta.page} pages={meta.pages} total={meta.total} onPage={setPage} />
        </>
      )}
    </div>
  );
}

function TogglePill({
  active,
  busy,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  busy: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
        active ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground hover:bg-muted',
      )}
    >
      {busy ? <Spinner className="h-3.5 w-3.5 text-current" /> : <Icon className={cn('h-3.5 w-3.5', active && 'fill-current')} />}
      {label}
    </button>
  );
}
