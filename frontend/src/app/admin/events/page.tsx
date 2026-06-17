'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, X, CalendarDays, MapPin } from 'lucide-react';
import { apiJson, apiForm } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  link?: string | null;
  status: string;
  bannerUrl?: string | null;
}

function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const empty = { title: '', description: '', startDate: '', endDate: '', location: '', link: '', status: 'published' };

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const r = await apiJson<{ data: AdminEvent[] }>('/api/admin/events');
    if (r.ok) setEvents(r.body.data);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const reset = () => {
    setEditingId(null);
    setForm({ ...empty });
    if (bannerRef.current) bannerRef.current.value = '';
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData();
    fd.set('title', form.title);
    fd.set('description', form.description);
    fd.set('startDate', form.startDate);
    fd.set('endDate', form.endDate);
    fd.set('location', form.location);
    fd.set('link', form.link);
    fd.set('status', form.status);
    if (bannerRef.current?.files?.[0]) fd.set('banner', bannerRef.current.files[0]);
    const r = editingId
      ? await apiForm(`/api/admin/events/${editingId}`, 'PUT', fd)
      : await apiForm('/api/admin/events', 'POST', fd);
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: editingId ? 'Event updated.' : 'Event created.' });
      reset();
      void load();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save event.' });
    }
  };

  const edit = (ev: AdminEvent) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description ?? '',
      startDate: toLocalInput(ev.startDate),
      endDate: toLocalInput(ev.endDate),
      location: ev.location ?? '',
      link: ev.link ?? '',
      status: ev.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (ev: AdminEvent) => {
    if (!confirm(`Delete event “${ev.title}”?`)) return;
    const r = await apiJson(`/api/admin/events/${ev.id}`, 'DELETE');
    if (r.ok) void load();
    else setMsg({ type: 'err', text: 'Could not delete event.' });
  };

  const fmt = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Events</h1>
      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>{msg.text}</p>
      ) : null}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold">
            {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Edit event' : 'New event'}
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start date &amp; time *</Label>
                <Input id="startDate" type="datetime-local" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End date &amp; time</Label>
                <Input id="endDate" type="datetime-local" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => set('location', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="link">Link</Label>
                <Input id="link" value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="banner">Banner image</Label>
                <Input id="banner" type="file" accept="image/*" ref={bannerRef} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner className="h-4 w-4 text-current" /> : null}
                {editingId ? 'Update event' : 'Create event'}
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
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <Card key={ev.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif font-semibold">{ev.title}</span>
                    <Badge variant={ev.status === 'published' ? 'success' : 'muted'}>{ev.status}</Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {fmt(ev.startDate)}
                      {ev.endDate ? ` – ${fmt(ev.endDate)}` : ''}
                    </span>
                    {ev.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {ev.location}
                      </span>
                    ) : null}
                  </p>
                  {ev.description ? <p className="mt-1 line-clamp-2 text-sm text-foreground/80">{ev.description}</p> : null}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button size="sm" variant="outline" onClick={() => edit(ev)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(ev)} aria-label="Delete">
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
