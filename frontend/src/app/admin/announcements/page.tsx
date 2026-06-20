'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, X, Megaphone, ExternalLink } from 'lucide-react';
import { apiJson } from '@/lib/client-api';
import { useAdminList } from '@/lib/use-admin-list';
import { AdminSearch, AdminPager } from '@/components/admin/list-controls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface AdminAnnouncement {
  id: string;
  message: string;
  link?: string | null;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  order: number;
}

function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const empty = { message: '', link: '', isActive: true, startDate: '', endDate: '', order: '0' };

export default function AdminAnnouncementsPage() {
  const { items, meta, loading, search, setPage, reload } = useAdminList<AdminAnnouncement>('/api/admin/announcements', 12);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const reset = () => {
    setEditingId(null);
    setForm({ ...empty });
  };
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const payload = {
      message: form.message,
      link: form.link || undefined,
      isActive: form.isActive,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      order: Number(form.order) || 0,
    };
    const r = editingId
      ? await apiJson(`/api/admin/announcements/${editingId}`, 'PUT', payload)
      : await apiJson('/api/admin/announcements', 'POST', payload);
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: editingId ? 'Announcement updated.' : 'Announcement created.' });
      reset();
      void reload();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save announcement.' });
    }
  };

  const edit = (a: AdminAnnouncement) => {
    setEditingId(a.id);
    setForm({
      message: a.message,
      link: a.link ?? '',
      isActive: a.isActive,
      startDate: toLocalInput(a.startDate),
      endDate: toLocalInput(a.endDate),
      order: String(a.order ?? 0),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (a: AdminAnnouncement) => {
    if (!confirm('Delete this announcement?')) return;
    const r = await apiJson(`/api/admin/announcements/${a.id}`, 'DELETE');
    if (r.ok) void reload();
    else setMsg({ type: 'err', text: 'Could not delete announcement.' });
  };

  const fmt = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Announcements</h1>
        <p className="text-muted-foreground">Manage the scrolling announcement bar at the top of the homepage.</p>
      </div>
      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>{msg.text}</p>
      ) : null}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold">
            {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Edit announcement' : 'New announcement'}
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                required
                maxLength={500}
                placeholder="🎵 Welcome to Swara — new keertanas added regularly."
              />
              <p className="text-xs text-muted-foreground">Emoji are welcome. Shown in the homepage announcement bar.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="link">Link (optional)</Label>
                <Input id="link" value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order">Order</Label>
                <Input id="order" type="number" value={form.order} onChange={(e) => set('order', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Show from (optional)</Label>
                <Input id="startDate" type="datetime-local" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">Show until (optional)</Label>
                <Input id="endDate" type="datetime-local" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="accent-[hsl(var(--primary))]" />
              Active (visible on the homepage)
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner className="h-4 w-4 text-current" /> : null}
                {editingId ? 'Update announcement' : 'Create announcement'}
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

      <AdminSearch onSearch={search} placeholder="Search announcements…" />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-7 w-7" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No announcements yet. Create one above.</p>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="flex items-start gap-2 font-medium">
                      <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{a.message}</span>
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={a.isActive ? 'success' : 'muted'}>{a.isActive ? 'Active' : 'Hidden'}</Badge>
                      {a.link ? (
                        <a href={a.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                          <ExternalLink className="h-3 w-3" /> link
                        </a>
                      ) : null}
                      {fmt(a.startDate) ? <span>from {fmt(a.startDate)}</span> : null}
                      {fmt(a.endDate) ? <span>until {fmt(a.endDate)}</span> : null}
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
          <AdminPager page={meta.page} pages={meta.pages} total={meta.total} onPage={setPage} />
        </>
      )}
    </div>
  );
}
