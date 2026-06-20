'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { apiJson, apiForm } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string;
  author?: string | null;
  tags: string[];
  status: string;
  publishedAt?: string | null;
}

const empty = { title: '', excerpt: '', body: '', author: '', tags: '', status: 'draft' };

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const r = await apiJson<{ data: AdminArticle[] }>('/api/admin/articles');
    if (r.ok) setArticles(r.body.data);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const reset = () => {
    setEditingId(null);
    setForm({ ...empty });
    if (coverRef.current) coverRef.current.value = '';
  };
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData();
    fd.set('title', form.title);
    fd.set('excerpt', form.excerpt);
    fd.set('body', form.body);
    fd.set('author', form.author);
    fd.set('tags', form.tags);
    fd.set('status', form.status);
    if (coverRef.current?.files?.[0]) fd.set('cover', coverRef.current.files[0]);
    const r = editingId
      ? await apiForm(`/api/admin/articles/${editingId}`, 'PUT', fd)
      : await apiForm('/api/admin/articles', 'POST', fd);
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: editingId ? 'Article updated.' : 'Article created.' });
      reset();
      void load();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save article.' });
    }
  };

  const edit = async (a: AdminArticle) => {
    const r = await apiJson<{ data: AdminArticle }>(`/api/admin/articles/${a.id}`);
    const full = r.ok ? r.body.data : a;
    setEditingId(a.id);
    setForm({
      title: full.title,
      excerpt: full.excerpt ?? '',
      body: full.body ?? '',
      author: full.author ?? '',
      tags: (full.tags ?? []).join(', '),
      status: full.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (a: AdminArticle) => {
    if (!confirm(`Delete article “${a.title}”?`)) return;
    const r = await apiJson(`/api/admin/articles/${a.id}`, 'DELETE');
    if (r.ok) void load();
    else setMsg({ type: 'err', text: 'Could not delete article.' });
  };

  const statusVariant = (s: string) => (s === 'published' ? 'success' : s === 'archived' ? 'warning' : 'muted');

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Articles</h1>
      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>{msg.text}</p>
      ) : null}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold">
            {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Edit article' : 'New article'}
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={form.author} onChange={(e) => set('author', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cover">Cover image</Label>
                <Input id="cover" type="file" accept="image/*" ref={coverRef} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input id="excerpt" value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Body (basic HTML allowed: &lt;p&gt; &lt;h2&gt; &lt;ul&gt; &lt;strong&gt; &lt;a&gt; …)</Label>
              <Textarea id="body" value={form.body} onChange={(e) => set('body', e.target.value)} required className="min-h-[200px] font-mono text-sm" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner className="h-4 w-4 text-current" /> : null}
                {editingId ? 'Update article' : 'Create article'}
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
      ) : articles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No articles yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif font-semibold">{a.title}</span>
                    <Badge variant={statusVariant(a.status)} className="capitalize">
                      {a.status}
                    </Badge>
                  </div>
                  {a.excerpt ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p> : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.author ? `${a.author} · ` : ''}/{a.slug}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={() => edit(a)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(a)} aria-label="Delete">
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
