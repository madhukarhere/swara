import Link from 'next/link';
import { getArticles } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  let result;
  try {
    result = await getArticles(`?page=${page}&limit=9`);
  } catch {
    return <div className="container py-20 text-center text-muted-foreground">Could not load articles. Is the API running?</div>;
  }
  const { data, meta } = result;

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Articles</h1>
        <p className="text-muted-foreground">
          {meta.total} article{meta.total === 1 ? '' : 's'}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed py-20 text-center text-muted-foreground">No articles published yet.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((a) => (
            <Link key={a.id} href={`/articles/${a.slug}`} className="group">
              <Card className="h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
                {a.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.coverUrl} alt={a.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 temple-gradient" />
                )}
                <CardContent className="p-4">
                  <h2 className="font-serif text-lg font-semibold leading-tight group-hover:text-primary">{a.title}</h2>
                  {a.excerpt ? <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p> : null}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {a.author ? `${a.author} · ` : ''}
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {meta.pages > 1 ? (
        <div className="flex items-center justify-center gap-3 pt-4">
          {page > 1 ? (
            <Link href={`/articles?page=${page - 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              ← Previous
            </Link>
          ) : null}
          <span className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.pages}
          </span>
          {page < meta.pages ? (
            <Link href={`/articles?page=${page + 1}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Next →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
