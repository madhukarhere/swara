import Link from 'next/link';
import { getSongs, getCategories } from '@/lib/api';
import { SongFilters } from '@/components/song-filters';
import { SongGrid, SongList } from '@/components/home/home-sections';
import { SongResults } from '@/components/song-results';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 5;

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const k of ['q', 'category', 'language', 'sort'] as const) {
    if (sp[k]) params.set(k, sp[k] as string);
  }
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  params.set('page', String(page));
  params.set('limit', String(PAGE_SIZE));

  let songs;
  let categories;
  try {
    const [result, cats] = await Promise.all([getSongs(`?${params.toString()}`), getCategories()]);
    songs = result;
    categories = cats.data;
  } catch {
    return <div className="container py-20 text-center text-muted-foreground">Could not load songs. Is the API running?</div>;
  }

  const { data, meta } = songs;
  const linkFor = (p: number) => {
    const q = new URLSearchParams(params);
    q.set('page', String(p));
    return `/songs?${q.toString()}`;
  };

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Songs</h1>
        <p className="text-muted-foreground">
          {meta.total} song{meta.total === 1 ? '' : 's'}
          {sp.q ? ` matching “${sp.q}”` : ''}
        </p>
      </div>

      <SongFilters categories={categories} />

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed py-20 text-center text-muted-foreground">
          No songs found. Try a different search or filter.
        </div>
      ) : (
        <SongResults grid={<SongGrid songs={data} />} list={<SongList songs={data} />} />
      )}

      {meta.pages > 1 ? (
        <nav className="flex flex-wrap items-center justify-center gap-1.5 pt-4" aria-label="Pagination">
          <Link
            href={linkFor(page - 1)}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), page <= 1 && 'pointer-events-none opacity-50')}
          >
            ← Prev
          </Link>
          {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={linkFor(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(buttonVariants({ variant: p === page ? 'default' : 'outline', size: 'sm' }), 'min-w-9')}
            >
              {p}
            </Link>
          ))}
          <Link
            href={linkFor(page + 1)}
            aria-disabled={page >= meta.pages}
            tabIndex={page >= meta.pages ? -1 : undefined}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), page >= meta.pages && 'pointer-events-none opacity-50')}
          >
            Next →
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
