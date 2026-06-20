'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { apiJson } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface AdminQuote {
  id: string;
  text: string;
  author?: string | null;
  language?: string | null;
  mode: string;
  isActive: boolean;
}

const empty = { text: '', author: '', language: '', mode: 'random', isActive: true };

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    const r = await apiJson<{ data: AdminQuote[] }>('/api/admin/quotes');
    if (r.ok) setQuotes(r.body.data);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const reset = () => {
    setEditingId(null);
    setForm({ ...empty });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const payload = {
      text: form.text,
      author: form.author || undefined,
      language: form.language || undefined,
      mode: form.mode,
      isActive: form.isActive,
    };
    const r = editingId
      ? await apiJson(`/api/admin/quotes/${editingId}`, 'PUT', payload)
      : await apiJson('/api/admin/quotes', 'POST', payload);
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: editingId ? 'Quote updated.' : 'Quote created.' });
      reset();
      void load();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save quote.' });
    }
  };

  const edit = (q: AdminQuote) => {
    setEditingId(q.id);
    setForm({ text: q.text, author: q.author ?? '', language: q.language ?? '', mode: q.mode, isActive: q.isActive });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (q: AdminQuote) => {
    if (!confirm('Delete this quote?')) return;
    const r = await apiJson(`/api/admin/quotes/${q.id}`, 'DELETE');
    if (r.ok) void load();
    else setMsg({ type: 'err', text: 'Could not delete quote.' });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Quotes</h1>
      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>{msg.text}</p>
      ) : null}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold">
            {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Edit quote' : 'New quote'}
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="text">Quote text *</Label>
              <Textarea id="text" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="author">Author / source</Label>
                <Input id="author" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="language">Language</Label>
                <Input id="language" value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mode">Mode</Label>
                <Select id="mode" value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))} className="w-full">
                  <option value="random">Random pool</option>
                  <option value="featured">Featured</option>
                </Select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="accent-[hsl(var(--primary))]"
              />
              Active (eligible for the homepage quote of the day)
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner className="h-4 w-4 text-current" /> : null}
                {editingId ? 'Update quote' : 'Create quote'}
              </Button>
              {editingId ? (
                <Button type="button" variant="ghost" onClick={reset}>
                  <X className="h-4 w-4" /> Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7" />
        </div>
      ) : quotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No quotes yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <blockquote className="font-serif italic">“{q.text}”</blockquote>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {q.author ? <span>— {q.author}</span> : null}
                    {q.language ? <span>· {q.language}</span> : null}
                    {q.mode === 'featured' ? <Badge variant="gold">Featured</Badge> : null}
                    {!q.isActive ? <Badge variant="muted">Inactive</Badge> : null}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={() => edit(q)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(q)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
