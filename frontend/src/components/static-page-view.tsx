import DOMPurify from 'isomorphic-dompurify';
import { Users2, HeartHandshake, FileCheck2, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MotifDivider } from '@/components/cultural/motif';

/** Icon rendered in the page header for each editable slug. */
const ICON_FOR_SLUG: Record<string, LucideIcon> = {
  about: Users2,
  contribute: HeartHandshake,
  terms: FileCheck2,
  disclaimer: ShieldAlert,
};

/**
 * Server component. Renders the shared branded header (icon + title + subtitle)
 * and the CMS-editable HTML body underneath.
 *
 * The body is sanitized with DOMPurify as defense-in-depth even though the
 * backend already runs sanitize-html with the same allowlist on save.
 */
export function StaticPageView({
  slug,
  title,
  subtitle,
  body,
}: {
  slug: string;
  title: string;
  subtitle?: string;
  body: string;
}) {
  const Icon = ICON_FOR_SLUG[slug] ?? Users2;

  // Sanitized via DOMPurify — allowlist matches backend cleanRich().
  const safeBody = DOMPurify.sanitize(body, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'hr'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):/i,
  });

  return (
    <div className="container max-w-3xl space-y-8 py-10">
      <header className="space-y-4 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl temple-gradient text-white shadow-sm">
          <Icon className="h-7 w-7" />
        </span>
        <h1 className="font-serif text-4xl font-bold">{title}</h1>
        {subtitle ? (
          <p className="mx-auto max-w-2xl text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>

      <MotifDivider />

      <Card>
        <CardContent className="p-6 sm:p-8">
          {/* DOMPurify-sanitized above */}
          <div className="article-body" dangerouslySetInnerHTML={{ __html: safeBody }} />
        </CardContent>
      </Card>
    </div>
  );
}

export function StaticPageFallback({ title }: { title: string }) {
  return (
    <div className="container max-w-3xl py-24 text-center">
      <h1 className="font-serif text-2xl font-bold">{title} is loading…</h1>
      <p className="mt-2 text-muted-foreground">
        Could not reach the API. Please try again in a moment.
      </p>
    </div>
  );
}
