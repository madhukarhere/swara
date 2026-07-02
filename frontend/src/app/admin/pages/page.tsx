'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileEdit, ExternalLink, Users2, HeartHandshake, FileCheck2, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiJson } from '@/lib/client-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface PageRow {
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

const ICONS: Record<string, LucideIcon> = {
  about: Users2,
  contribute: HeartHandshake,
  terms: FileCheck2,
  disclaimer: ShieldAlert,
};

export default function AdminPagesPage() {
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson<{ data: PageRow[] }>('/api/admin/pages').then((r) => {
      if (r.ok) setRows(r.body.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Static Pages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the About, Contribute, Terms and Disclaimer pages. Each supports basic HTML
          (headings, paragraphs, lists, links, blockquotes).
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((p) => {
            const Icon = ICONS[p.slug] ?? FileEdit;
            return (
              <Card key={p.slug}>
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-lg font-semibold">{p.title}</p>
                    <p className="truncate text-sm text-muted-foreground">/{p.slug}</p>
                    {p.updatedAt ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last updated {new Date(p.updatedAt).toLocaleString('en-GB')}
                        {p.updatedBy ? ` · by ${p.updatedBy}` : ''}
                      </p>
                    ) : null}
                    <div className="mt-3 flex gap-2">
                      <Link href={`/admin/pages/${p.slug}`}>
                        <Button size="sm">
                          <FileEdit className="h-4 w-4" /> Edit
                        </Button>
                      </Link>
                      <a href={`/${p.slug}`} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" /> View
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
