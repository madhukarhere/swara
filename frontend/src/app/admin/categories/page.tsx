'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { apiJson, apiForm } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('0');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const r = await apiJson<{ data: Category[] }>('/api/admin/categories');
    if (r.ok) setCats(r.body.data);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const reset = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setOrder('0');
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData();
    fd.set('name', name);
    fd.set('description', description);
    fd.set('order', order);
    if (fileRef.current?.files?.[0]) fd.set('cover', fileRef.current.files[0]);
    const r = editingId
      ? await apiForm(`/api/admin/categories/${editingId}`, 'PUT', fd)
      : await apiForm('/api/admin/categories', 'POST', fd);
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: editingId ? 'Category updated.' : 'Category created.' });
      reset();
      void load();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save category.' });
    }
  };

  const edit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description ?? '');
    setOrder(String(c.order ?? 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (c: Category) => {
    if (!confirm(`Delete category “${c.name}”?`)) return;
    const r = await apiJson(`/api/admin/categories/${c.id}`, 'DELETE');
    if (r.ok) void load();
    else setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not delete.' });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Categories</h1>
      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>{msg.text}</p>
      ) : null}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold">
            {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Edit category' : 'New category'}
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order">Order</Label>
                <Input id="order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cover">Cover image</Label>
                <Input id="cover" type="file" accept="image/*" ref={fileRef} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner className="h-4 w-4 text-current" /> : null}
                {editingId ? 'Update' : 'Create'}
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-serif font-semibold">{c.name}</p>
                  {c.description ? <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p> : null}
                  <Badge variant="muted" className="mt-2">
                    {c.songCount ?? 0} songs
                  </Badge>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={() => edit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(c)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {cats.length === 0 ? <p className="text-sm text-muted-foreground">No categories yet.</p> : null}
        </div>
      )}
    </div>
  );
}
