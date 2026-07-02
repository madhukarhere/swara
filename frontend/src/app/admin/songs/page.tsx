'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Pencil, Music } from 'lucide-react';
import { apiJson, apiForm } from '@/lib/client-api';
import { useAdminList } from '@/lib/use-admin-list';
import { AdminSearch, AdminPager } from '@/components/admin/list-controls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { formatNumber } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface AdminSong {
  id: string;
  title: string;
  category: Category | string | null;
  status: string;
  playCount: number;
  isFeatured: boolean;
  isTop5: boolean;
  hasAudio: boolean;
  lyricsCount?: number;
}

export default function AdminSongsPage() {
  const { items: songs, meta, loading, search, setPage, setFilter, filters, reload } = useAdminList<AdminSong>('/api/admin/songs', 20);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Category dropdown needs ALL categories including hidden ones so admins can
  // still assign songs to them — use the admin unpaginated endpoint.
  useEffect(() => {
    apiJson<{ data: Category[] }>('/api/admin/categories/all').then((r) => {
      if (r.ok) setCategories(r.body.data);
    });
  }, []);

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    fd.set('isFeatured', fd.get('isFeatured') ? 'true' : 'false');
    fd.set('isTop5', fd.get('isTop5') ? 'true' : 'false');
    const r = await apiForm('/api/admin/songs', 'POST', fd);
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: 'Song created.' });
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
      void reload();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not create song.' });
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete “${title}”? This also removes its lyrics and comments.`)) return;
    const r = await apiJson(`/api/admin/songs/${id}`, 'DELETE');
    if (r.ok) void reload();
    else setMsg({ type: 'err', text: 'Could not delete song.' });
  };

  const catName = (c: Category | string | null) => (c && typeof c === 'object' ? c.name : '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Songs</h1>
          <p className="text-muted-foreground">{meta.total} total</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4" /> New Song
        </Button>
      </div>

      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>{msg.text}</p>
      ) : null}

      {showForm ? (
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 font-serif text-lg font-semibold">Add a new song</h2>
            {categories.length === 0 ? (
              <p className="text-sm text-amber-600">Create a category first before adding songs.</p>
            ) : (
              <form onSubmit={create} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category *</Label>
                    <Select id="category" name="category" required defaultValue="" className="w-full">
                      <option value="" disabled>
                        Select…
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="singer">Singer</Label>
                    <Input id="singer" name="singer" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="composer">Composer</Label>
                    <Input id="composer" name="composer" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lyricist">Lyricist</Label>
                    <Input id="lyricist" name="lyricist" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" name="tags" placeholder="bhajan, krishna" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="audio">Audio file</Label>
                    <Input id="audio" name="audio" type="file" accept="audio/*" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cover">Cover image</Label>
                    <Input id="cover" name="cover" type="file" accept="image/*" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="status">Status</Label>
                    <Select id="status" name="status" defaultValue="published" className="w-full">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isFeatured" className="accent-[hsl(var(--primary))]" /> Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isTop5" className="accent-[hsl(var(--primary))]" /> Top 5
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? <Spinner className="h-4 w-4 text-current" /> : null}
                    Create song
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">After creating, open the song to add multi-language lyrics.</p>
              </form>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearch onSearch={search} placeholder="Search songs…" />
        <Select
          aria-label="Filter by status"
          value={filters.status ?? 'all'}
          onChange={(e) => setFilter('status', e.target.value)}
          className="w-full sm:w-44"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7" />
        </div>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Plays</th>
                    <th className="px-4 py-3">Lyrics</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {songs.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">
                        <span className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-muted-foreground" />
                          {s.title}
                          {s.isTop5 ? <Badge variant="gold">Top 5</Badge> : null}
                          {s.isFeatured ? <Badge>Featured</Badge> : null}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{catName(s.category)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.status === 'published' ? 'success' : 'muted'}>{s.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatNumber(s.playCount)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.lyricsCount ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/songs/${s.id}`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => remove(s.id, s.title)} aria-label="Delete">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {songs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                        No songs found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>
          <AdminPager page={meta.page} pages={meta.pages} total={meta.total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
