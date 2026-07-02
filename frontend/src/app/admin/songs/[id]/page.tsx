'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2, Languages } from 'lucide-react';
import { apiJson, apiForm } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import type { Category, Lyrics } from '@/lib/types';

interface AdminSongDetail {
  id: string;
  title: string;
  category: Category | string | null;
  singer?: string | null;
  composer?: string | null;
  lyricist?: string | null;
  tags: string[];
  status: string;
  isFeatured: boolean;
  isTop5: boolean;
  hasAudio: boolean;
  coverUrl?: string | null;
  lyrics: Lyrics[];
}

export default function EditSongPage() {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<AdminSongDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    const [s, c] = await Promise.all([
      apiJson<{ data: AdminSongDetail }>(`/api/admin/songs/${id}`),
      apiJson<{ data: Category[] }>('/api/admin/categories/all'), // includes hidden — admins may need to keep an existing assignment
    ]);
    if (s.ok) setSong(s.body.data);
    if (c.ok) setCategories(c.body.data);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [id]);

  const saveSong = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    fd.set('isFeatured', fd.get('isFeatured') ? 'true' : 'false');
    fd.set('isTop5', fd.get('isTop5') ? 'true' : 'false');
    const r = await apiForm(`/api/admin/songs/${id}`, 'PUT', fd);
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: 'Song saved.' });
      void load();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save.' });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  if (!song) return <p className="text-muted-foreground">Song not found.</p>;

  const categoryId = song.category && typeof song.category === 'object' ? song.category.id : (song.category ?? '');

  return (
    <div className="space-y-6">
      <Link href="/admin/songs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to songs
      </Link>
      <h1 className="font-serif text-3xl font-bold">{song.title}</h1>
      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>{msg.text}</p>
      ) : null}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 font-serif text-lg font-semibold">Song details</h2>
          <form onSubmit={saveSong} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={song.title} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select id="category" name="category" defaultValue={String(categoryId)} className="w-full">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="singer">Singer</Label>
                <Input id="singer" name="singer" defaultValue={song.singer ?? ''} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="composer">Composer</Label>
                <Input id="composer" name="composer" defaultValue={song.composer ?? ''} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lyricist">Lyricist</Label>
                <Input id="lyricist" name="lyricist" defaultValue={song.lyricist ?? ''} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" name="tags" defaultValue={song.tags.join(', ')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="audio">Replace audio {song.hasAudio ? <Badge variant="muted">has audio</Badge> : null}</Label>
                <Input id="audio" name="audio" type="file" accept="audio/*" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cover">Replace cover</Label>
                <Input id="cover" name="cover" type="file" accept="image/*" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={song.status} className="w-full">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isFeatured" defaultChecked={song.isFeatured} className="accent-[hsl(var(--primary))]" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isTop5" defaultChecked={song.isTop5} className="accent-[hsl(var(--primary))]" /> Top 5
              </label>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <Spinner className="h-4 w-4 text-current" /> : <Save className="h-4 w-4" />}
              Save details
            </Button>
          </form>
        </CardContent>
      </Card>

      <LyricsManager songId={id} lyrics={song.lyrics} onChange={load} />
    </div>
  );
}

function LyricsManager({ songId, lyrics, onChange }: { songId: string; lyrics: Lyrics[]; onChange: () => void }) {
  const [items, setItems] = useState<Lyrics[]>(lyrics);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setItems(lyrics);
  }, [lyrics]);

  const patch = (id: string, field: keyof Lyrics, value: unknown) =>
    setItems((arr) => arr.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  const saveOne = async (l: Lyrics) => {
    setErr('');
    const r = await apiJson(`/api/admin/lyrics/${l.id}`, 'PUT', {
      language: l.language,
      languageCode: l.languageCode,
      script: l.script ?? undefined,
      content: l.content,
      isDefault: l.isDefault,
      order: l.order,
    });
    if (r.ok) onChange();
    else setErr((r.body as { error?: string }).error || 'Could not save lyric.');
  };

  const deleteOne = async (l: Lyrics) => {
    if (!confirm(`Delete the ${l.language} lyrics?`)) return;
    const r = await apiJson(`/api/admin/lyrics/${l.id}`, 'DELETE');
    if (r.ok) onChange();
    else setErr('Could not delete lyric.');
  };

  const addNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr('');
    const f = e.currentTarget;
    const data = new FormData(f);
    const r = await apiJson('/api/admin/lyrics', 'POST', {
      song: songId,
      language: data.get('language'),
      languageCode: data.get('languageCode'),
      script: data.get('script') || undefined,
      content: data.get('content'),
      isDefault: !!data.get('isDefault'),
      order: Number(data.get('order') || 0),
    });
    if (r.ok) {
      f.reset();
      setAdding(false);
      onChange();
    } else {
      setErr((r.body as { error?: string }).error || 'Could not add lyric.');
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
            <Languages className="h-5 w-5 text-primary" /> Lyrics ({items.length} languages)
          </h2>
          <Button size="sm" onClick={() => setAdding((a) => !a)}>
            <Plus className="h-4 w-4" /> Add language
          </Button>
        </div>
        {err ? <p className="mb-3 text-sm font-medium text-red-600">{err}</p> : null}

        {adding ? (
          <form onSubmit={addNew} className="mb-5 space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <Input name="language" placeholder="Language (e.g. Telugu)" required />
              <Input name="languageCode" placeholder="Code (te)" required />
              <Input name="script" placeholder="Script (optional)" />
              <Input name="order" type="number" placeholder="Order" defaultValue={items.length} />
            </div>
            <Textarea name="content" placeholder="Lyrics…" required className="min-h-[120px] font-serif" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isDefault" className="accent-[hsl(var(--primary))]" /> Set as default language
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Add
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        <div className="space-y-4">
          {items.map((l) => (
            <div key={l.id} className="rounded-lg border p-4">
              <div className="mb-2 grid gap-2 sm:grid-cols-4">
                <Input value={l.language} onChange={(e) => patch(l.id, 'language', e.target.value)} />
                <Input value={l.languageCode} onChange={(e) => patch(l.id, 'languageCode', e.target.value)} />
                <Input value={l.script ?? ''} placeholder="Script" onChange={(e) => patch(l.id, 'script', e.target.value)} />
                <Input
                  type="number"
                  value={l.order}
                  onChange={(e) => patch(l.id, 'order', Number(e.target.value))}
                />
              </div>
              <Textarea
                value={l.content}
                onChange={(e) => patch(l.id, 'content', e.target.value)}
                className="min-h-[120px] font-serif"
              />
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={l.isDefault}
                    onChange={(e) => patch(l.id, 'isDefault', e.target.checked)}
                    className="accent-[hsl(var(--primary))]"
                  />
                  Default
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => saveOne(l)}>
                    <Save className="h-3.5 w-3.5" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteOne(l)} aria-label="Delete lyric">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 ? <p className="text-sm text-muted-foreground">No lyrics yet. Add a language above.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
