import { Quote as QuoteIcon } from 'lucide-react';
import { getQuotes } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { QuoteItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function QuotesPage() {
  let quotes: QuoteItem[] = [];
  try {
    quotes = (await getQuotes()).data;
  } catch {
    /* API down — render empty */
  }

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Quotes</h1>
        <p className="text-muted-foreground">Words of wisdom &amp; devotion</p>
      </div>

      {quotes.length === 0 ? (
        <p className="text-muted-foreground">No quotes available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q) => (
            <Card key={q.id} className="h-full">
              <CardContent className="flex h-full flex-col p-5">
                <QuoteIcon className="mb-2 h-5 w-5 text-primary/60" />
                <blockquote className="flex-1 font-serif text-lg italic leading-relaxed">“{q.text}”</blockquote>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{q.author ? `— ${q.author}` : ''}</span>
                  {q.featured ? <Badge variant="gold">Featured</Badge> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
