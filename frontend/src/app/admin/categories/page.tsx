'use client';

import { useRef, useState } from 'react';
import { Plus, Trash2, Pencil, X, Eye, EyeOff } from 'lucide-react';
import { apiJson, apiForm } from '@/lib/client-api';
import { useAdminList } from '@/lib/use-admin-list';
import { AdminSearch, AdminPager } from '@/components/admin/list-controls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const { items: cats, meta, loading, search, setPage, reload } = useAdminList<Category>('/api/admin/categories', 12);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('0');
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setOrder('0');
    setIsVisible(true);
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
    fd.set('isVisible', String(isVisible));
    if (fileRef.current?.files?.[0]) fd.set('cover', fileRef.current.files[0]);
    const r = editingId
      ? await apiForm(`/api/admin/categories/${editingId}`, 'PUT', fd)
      : await apiForm('/api/admin/categories', 'POST', fd);
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: editingId ? 'Category updated.' : 'Category created.' });
      reset();
      void reload();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save category.' });
    }
  };

  const edit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description ?? '');
    setOrder(String(c.order ?? 0));
    setIsVisible(c.isVisible !== false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleVisibility = async (c: Category) => {
    const next = !(c.isVisible !== false);
    const fd = new FormData();
    fd.set('isVisible', String(next));
    const r = await apiForm(`/api/admin/categories/${c.id}`, 'PUT', fd);
    if (r.ok) {
      setMsg({ type: 'ok', text: next ? `“${c.name}” is now visible.` : `“${c.name}” is now hidden.` });
      void reload();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not update visibility.' });
    }
  };

  const remove = async (c: Category) => {
    if (!confirm(`Delete category “${c.name}”?`)) return;
    const r = await apiJson(`/api/admin/categories/${c.id}`, 'DELETE');
    if (r.ok) void reload();
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
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span>Visible on the site</span>
              <span className="text-xs text-muted-foreground">
                — hidden categories won&apos;t appear in filters, browse chips, or homepage lists.
              </span>
            </label>
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

      <AdminSearch onSearch={search} placeholder="Search categories…" />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7" />
        </div>
      ) : cats.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories found.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c) => {
              const visible = c.isVisible !== false;
              return (
                <Card key={c.id} className={visible ? undefined : 'opacity-70'}>
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-serif font-semibold">{c.name}</p>
                      {c.description ? <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p> : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="muted">{c.songCount ?? 0} songs</Badge>
                        {visible ? (
                          <Badge variant="muted" className="border-green-600/30 bg-green-50 text-green-700">
                            <Eye className="mr-1 h-3 w-3" /> Visible
                          </Badge>
                        ) : (
                          <Badge variant="muted" className="border-amber-600/30 bg-amber-50 text-amber-700">
                            <EyeOff className="mr-1 h-3 w-3" /> Hidden
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleVisibility(c)}
                        aria-label={visible ? 'Hide' : 'Show'}
                        title={visible ? 'Hide from site' : 'Show on site'}
                      >
                        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => edit(c)} aria-label="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(c)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <AdminPager page={meta.page} pages={meta.pages} total={meta.total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
