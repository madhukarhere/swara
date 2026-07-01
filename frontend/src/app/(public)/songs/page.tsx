import Link from 'next/link';
import { getSongs, getCategories } from '@/lib/api';
import { SongFilters } from '@/components/song-filters';
import { SongGrid, SongList } from '@/components/home/home-sections';
import { SongResults } from '@/components/song-results';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ALLOWED_LIMITS = [12, 24, 48];
const DEFAULT_LIMIT = 48;

const RANGES: { key: string; label: string; letters: string[] }[] = [
  { key: 'A-C', label: 'A–C', letters: ['A', 'B', 'C'] },
  { key: 'D-F', label: 'D–F', letters: ['D', 'E', 'F'] },
  { key: 'G-I', label: 'G–I', letters: ['G', 'H', 'I'] },
  { key: 'J-L', label: 'J–L', letters: ['J', 'K', 'L'] },
  { key: 'M-O', label: 'M–O', letters: ['M', 'N', 'O'] },
  { key: 'P-R', label: 'P–R', letters: ['P', 'Q', 'R'] },
  { key: 'S-U', label: 'S–U', letters: ['S', 'T', 'U'] },
  { key: 'V-Z', label: 'V–Z', letters: ['V', 'W', 'X', 'Y', 'Z'] },
  { key: '#', label: '#', letters: ['#'] },
];

/** Compact page list with ellipses: 1 … 4 5 [6] 7 8 … 36 */
function pageWindow(current: number, total: number): (number | 'gap')[] {
  const keep = new Set<number>([1, total]);
  for (let i = current - 1; i <= current + 1; i += 1) if (i >= 1 && i <= total) keep.add(i);
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('gap');
    out.push(p);
    prev = p;
  }
  return out;
}

function Pager({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (n: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={hrefFor(page - 1)}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), page <= 1 && 'pointer-events-none opacity-50')}
      >
        ← Prev
      </Link>
      {pageWindow(page, pages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(buttonVariants({ variant: p === page ? 'default' : 'outline', size: 'sm' }), 'min-w-9')}
          >
            {p}
          </Link>
        ),
      )}
      <Link
        href={hrefFor(page + 1)}
        aria-disabled={page >= pages}
        tabIndex={page >= pages ? -1 : undefined}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), page >= pages && 'pointer-events-none opacity-50')}
      >
        Next →
      </Link>
    </nav>
  );
}

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const sort = sp.sort || 'title'; // alphabetical by default
  const letter = sp.letter || '';
  const limit = ALLOWED_LIMITS.includes(Number(sp.limit)) ? Number(sp.limit) : DEFAULT_LIMIT;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  const apiParams = new URLSearchParams();
  for (const k of ['q', 'category', 'language'] as const) if (sp[k]) apiParams.set(k, sp[k] as string);
  apiParams.set('sort', sort);
  if (letter) apiParams.set('letter', letter);
  apiParams.set('page', String(page));
  apiParams.set('limit', String(limit));

  let songs;
  let categories;
  try {
    const [result, cats] = await Promise.all([getSongs(`?${apiParams.toString()}`), getCategories()]);
    songs = result;
    categories = cats.data;
  } catch {
    return <div className="container py-20 text-center text-muted-foreground">Could not load songs. Is the API running?</div>;
  }

  const { data, meta, letters = {} } = songs;
  const rangeCount = (r: (typeof RANGES)[number]) => r.letters.reduce((n, l) => n + (letters[l] || 0), 0);

  const hrefWith = (overrides: Record<string, string | null>) => {
    const p = new URLSearchParams();
    for (const k of ['q', 'category', 'language'] as const) if (sp[k]) p.set(k, sp[k] as string);
    if (sort !== 'title') p.set('sort', sort);
    if (limit !== DEFAULT_LIMIT) p.set('limit', String(limit));
    if (letter) p.set('letter', letter);
    for (const [k, v] of Object.entries(overrides)) v === null ? p.delete(k) : p.set(k, v);
    const s = p.toString();
    return s ? `/songs?${s}` : '/songs';
  };
  const letterHref = (key: string | null) => hrefWith({ letter: key, page: null });
  const pageHref = (n: number) => hrefWith({ page: String(n) });

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Songs</h1>
        <p className="text-muted-foreground">
          {meta.total} song{meta.total === 1 ? '' : 's'}
          {sp.q ? ` matching “${sp.q}”` : ''}
          {letter ? ` · ${letter === '#' ? 'other' : letter}` : ''}
          {meta.pages > 1 ? ` · page ${page} of ${meta.pages}` : ''}
        </p>
      </div>

      <SongFilters categories={categories} />

      {/* Alphabetical range navigation */}
      <nav className="flex flex-wrap gap-1.5" aria-label="Browse by letter range">
        <Link href={letterHref(null)} className={cn(buttonVariants({ variant: letter ? 'outline' : 'default', size: 'sm' }))}>
          All
        </Link>
        {RANGES.map((r) => {
          const count = rangeCount(r);
          const active = letter === r.key;
          const empty = count === 0 && !active;
          return (
            <Link
              key={r.key}
              href={empty ? '#' : letterHref(r.key)}
              aria-disabled={empty}
              aria-current={active ? 'true' : undefined}
              tabIndex={empty ? -1 : undefined}
              title={count ? `${count} song${count === 1 ? '' : 's'}` : 'No songs'}
              className={cn(
                buttonVariants({ variant: active ? 'default' : 'outline', size: 'sm' }),
                empty && 'pointer-events-none opacity-40',
              )}
            >
              {r.label}
              {count > 0 ? <span className="ml-1 text-xs opacity-70">{count}</span> : null}
            </Link>
          );
        })}
      </nav>

      {/* Top pagination — visible without scrolling */}
      <Pager page={page} pages={meta.pages} hrefFor={pageHref} />

      {/* Results — height follows the number of songs on the page (the page-size). */}
      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed py-20 text-center text-muted-foreground">
          No songs found{letter ? ' in this range' : ''}. Try another range or filter.
        </div>
      ) : (
        <SongResults grid={<SongGrid songs={data} />} list={<SongList songs={data} />} />
      )}

      {/* Bottom pagination */}
      <Pager page={page} pages={meta.pages} hrefFor={pageHref} />
    </div>
  );
}
