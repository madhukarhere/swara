import Link from 'next/link';
import { getSongs, getCategories } from '@/lib/api';
import { SongFilters } from '@/components/song-filters';
import { SongGrid } from '@/components/home/home-sections';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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
  params.set('limit', '15');

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
        <SongGrid songs={data} />
      )}

      {meta.pages > 1 ? (
        <div className="flex items-center justify-center gap-3 pt-4">
          {page > 1 ? (
            <Link href={linkFor(page - 1)} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              ← Previous
            </Link>
          ) : null}
          <span className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.pages}
          </span>
          {page < meta.pages ? (
            <Link href={linkFor(page + 1)} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Next →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
