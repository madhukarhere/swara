import Link from 'next/link';
import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { getArticle } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();

  // Body is already sanitized server-side (sanitize-html allowlist); sanitize again
  // here with DOMPurify as defense-in-depth before rendering.
  const safeBody = DOMPurify.sanitize(a.body, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'hr'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  return (
    <article className="container max-w-3xl py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/articles" className="hover:text-foreground">
          Articles
        </Link>{' '}
        / <span className="text-foreground">{a.title}</span>
      </nav>

      <h1 className="font-serif text-4xl font-bold leading-tight">{a.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {a.author ? `By ${a.author} · ` : ''}
        {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
      </p>

      {a.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.coverUrl} alt={a.title} className="mt-6 max-h-[360px] w-full rounded-xl border object-cover" />
      ) : null}

      {/* Sanitized via DOMPurify above */}
      <div className="article-body mt-6" dangerouslySetInnerHTML={{ __html: safeBody }} />

      {a.tags.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
          {a.tags.map((t) => (
            <Badge key={t} variant="muted">
              {t}
            </Badge>
          ))}
        </div>
      ) : null}
    </article>
  );
}
