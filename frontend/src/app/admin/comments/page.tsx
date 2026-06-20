'use client';

import { Check, X, Trash2 } from 'lucide-react';
import { apiJson } from '@/lib/client-api';
import { useAdminList } from '@/lib/use-admin-list';
import { AdminSearch, AdminPager } from '@/components/admin/list-controls';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { StarRating } from '@/components/star-rating';
import { cn } from '@/lib/utils';

interface AdminComment {
  id: string;
  name: string;
  email?: string | null;
  rating?: number | null;
  comment: string;
  status: string;
  createdAt?: string | null;
  song?: { title: string; slug: string } | string | null;
}
interface Counts {
  pending: number;
  approved: number;
  rejected: number;
}

const TABS = ['pending', 'approved', 'rejected', 'all'] as const;

export default function AdminCommentsPage() {
  const { items, meta, loading, response, search, setPage, setFilter, filters, reload } = useAdminList<AdminComment>(
    '/api/admin/comments',
    20,
  );
  const activeTab = (filters.status as string) ?? 'pending';
  const counts = ((response?.counts as Counts) ?? { pending: 0, approved: 0, rejected: 0 });

  const moderate = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    const r = await apiJson(`/api/admin/comments/${id}`, 'PATCH', { status });
    if (r.ok) void reload();
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this comment permanently?')) return;
    const r = await apiJson(`/api/admin/comments/${id}`, 'DELETE');
    if (r.ok) void reload();
  };

  const songTitle = (s: AdminComment['song']) => (s && typeof s === 'object' ? s.title : '');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Comments</h1>
        <p className="text-muted-foreground">Moderate visitor comments before they appear publicly.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setFilter('status', t)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                activeTab === t ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t}
              {t === 'pending' && counts.pending > 0 ? (
                <Badge variant="warning" className="ml-1.5">
                  {counts.pending}
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
        <AdminSearch onSearch={search} placeholder="Search name or comment…" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {activeTab === 'all' ? '' : activeTab} comments.</p>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    {c.rating ? <StarRating value={c.rating} readOnly size={14} /> : null}
                    <Badge
                      variant={c.status === 'approved' ? 'success' : c.status === 'rejected' ? 'warning' : 'muted'}
                      className="capitalize"
                    >
                      {c.status}
                    </Badge>
                    {songTitle(c.song) ? <span className="text-xs text-muted-foreground">on “{songTitle(c.song)}”</span> : null}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{c.comment}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {c.email ? `${c.email} · ` : ''}
                      {c.createdAt ? new Date(c.createdAt).toLocaleString('en-GB') : ''}
                    </span>
                    <div className="flex gap-2">
                      {c.status !== 'approved' ? (
                        <Button size="sm" variant="outline" onClick={() => moderate(c.id, 'approved')}>
                          <Check className="h-3.5 w-3.5 text-green-600" /> Approve
                        </Button>
                      ) : null}
                      {c.status !== 'rejected' ? (
                        <Button size="sm" variant="outline" onClick={() => moderate(c.id, 'rejected')}>
                          <X className="h-3.5 w-3.5 text-amber-600" /> Reject
                        </Button>
                      ) : null}
                      <Button size="sm" variant="ghost" onClick={() => remove(c.id)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <AdminPager page={meta.page} pages={meta.pages} total={meta.total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
