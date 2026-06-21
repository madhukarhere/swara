'use client';

import { useState } from 'react';
import { Mail, Phone, Trash2, Reply, Send, X } from 'lucide-react';
import { apiJson } from '@/lib/client-api';
import { useAdminList } from '@/lib/use-admin-list';
import { AdminSearch, AdminPager } from '@/components/admin/list-controls';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  category: string;
  message: string;
  status: string;
  replyText?: string | null;
  repliedAt?: string | null;
  createdAt?: string | null;
}

const TABS = ['new', 'replied', 'all'] as const;

export default function AdminContactPage() {
  const { items, meta, loading, response, search, setPage, setFilter, filters, reload } = useAdminList<ContactMsg>(
    '/api/admin/contact',
    15,
  );
  const activeTab = (filters.status as string) ?? 'all';
  const counts = ((response?.counts as { new: number; replied: number }) ?? { new: 0, replied: 0 });

  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'warn' | 'err'; text: string } | null>(null);

  const startReply = (c: ContactMsg) => {
    setReplyingId(c.id);
    setReplyText('');
    setMsg(null);
  };

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    const r = await apiJson<{ sent: boolean; message: string; error?: string }>(`/api/admin/contact/${id}/reply`, 'POST', { reply: replyText });
    setSending(false);
    if (r.ok) {
      setMsg({ type: r.body.sent ? 'ok' : 'warn', text: r.body.message });
      setReplyingId(null);
      setReplyText('');
      void reload();
    } else {
      setMsg({ type: 'err', text: r.body.error || 'Could not send reply.' });
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this message permanently?')) return;
    const r = await apiJson(`/api/admin/contact/${id}`, 'DELETE');
    if (r.ok) void reload();
  };

  const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('en-GB') : '');
  const msgClass =
    msg?.type === 'ok' ? 'text-green-600' : msg?.type === 'warn' ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground">Messages from the public Contact form. Reply to email the sender.</p>
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
              {t === 'new' && counts.new > 0 ? (
                <Badge variant="warning" className="ml-1.5">
                  {counts.new}
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
        <AdminSearch onSearch={search} placeholder="Search name, email, message…" />
      </div>

      {msg ? <p className={cn('text-sm font-medium', msgClass)}>{msg.text}</p> : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {activeTab === 'all' ? '' : activeTab} messages.</p>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    <Badge variant="muted" className="capitalize">
                      {c.category}
                    </Badge>
                    <Badge variant={c.status === 'replied' ? 'success' : 'warning'} className="capitalize">
                      {c.status}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">{fmt(c.createdAt)}</span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                      <Mail className="h-3.5 w-3.5" /> {c.email}
                    </a>
                    {c.mobile ? (
                      <a href={`tel:${c.mobile}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Phone className="h-3.5 w-3.5" /> {c.mobile}
                      </a>
                    ) : null}
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{c.message}</p>

                  {c.replyText ? (
                    <div className="mt-3 rounded-lg border-l-2 border-primary bg-muted/40 p-3 text-sm">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Your reply · {fmt(c.repliedAt)}</p>
                      <p className="whitespace-pre-wrap text-foreground/90">{c.replyText}</p>
                    </div>
                  ) : null}

                  {replyingId === c.id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Write a reply to ${c.name} (${c.email})…`}
                        className="min-h-[100px]"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => sendReply(c.id)} disabled={sending || !replyText.trim()}>
                          {sending ? <Spinner className="h-4 w-4 text-current" /> : <Send className="h-3.5 w-3.5" />}
                          Send reply
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setReplyingId(null)}>
                          <X className="h-4 w-4" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startReply(c)}>
                        <Reply className="h-3.5 w-3.5" /> {c.status === 'replied' ? 'Reply again' : 'Reply'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(c.id)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
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
