'use client';

import { useEffect, useRef, useState } from 'react';
import { Save, ImageIcon, Trash2 } from 'lucide-react';
import { apiJson, apiForm } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface DevotionData {
  devotionPanel: {
    enabled: boolean;
    left: { image: string; imageUrl: string | null; title: string; caption: string };
    right: { image: string; imageUrl: string | null; title: string; caption: string };
  };
  updatedAt: string | null;
}

export default function AdminHomepagePage() {
  const [data, setData] = useState<DevotionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [leftTitle, setLeftTitle] = useState('');
  const [leftCaption, setLeftCaption] = useState('');
  const [rightTitle, setRightTitle] = useState('');
  const [rightCaption, setRightCaption] = useState('');
  const [clearLeft, setClearLeft] = useState(false);
  const [clearRight, setClearRight] = useState(false);
  const leftFileRef = useRef<HTMLInputElement>(null);
  const rightFileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    apiJson<{ data: DevotionData }>('/api/admin/homepage-settings').then((r) => {
      if (r.ok) {
        setData(r.body.data);
        const d = r.body.data.devotionPanel;
        setEnabled(d.enabled);
        setLeftTitle(d.left.title);
        setLeftCaption(d.left.caption);
        setRightTitle(d.right.title);
        setRightCaption(d.right.caption);
        setClearLeft(false);
        setClearRight(false);
      }
      setLoading(false);
    });
  };
  useEffect(load, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData();
    fd.set('enabled', String(enabled));
    fd.set('leftTitle', leftTitle);
    fd.set('leftCaption', leftCaption);
    fd.set('rightTitle', rightTitle);
    fd.set('rightCaption', rightCaption);
    if (clearLeft) fd.set('clearLeft', 'true');
    if (clearRight) fd.set('clearRight', 'true');
    if (leftFileRef.current?.files?.[0]) fd.set('leftImage', leftFileRef.current.files[0]);
    if (rightFileRef.current?.files?.[0]) fd.set('rightImage', rightFileRef.current.files[0]);
    const r = await apiForm('/api/admin/homepage-settings/devotion', 'PUT', fd);
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: 'Homepage devotion panel updated.' });
      if (leftFileRef.current) leftFileRef.current.value = '';
      if (rightFileRef.current) rightFileRef.current.value = '';
      load();
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  const leftUrl = data?.devotionPanel.left.imageUrl;
  const rightUrl = data?.devotionPanel.right.imageUrl;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Homepage — Devotion Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The two large images that greet visitors at the top of the homepage (Vande Mataram / Saraswati Veena).
          Upload replacement images and change the titles/captions here.
        </p>
      </div>

      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>
          {msg.text}
        </p>
      ) : null}

      <form onSubmit={save} className="space-y-6">
        <Card>
          <CardContent className="space-y-3 p-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span>Show the devotion panel on the homepage</span>
            </label>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT — Bharat Mata */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="font-serif text-xl font-semibold">Left image (Vande Mataram)</h2>

              <div className="flex items-center justify-center rounded-lg border bg-muted/30 p-3">
                {leftUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={leftUrl}
                    alt="Left"
                    className="max-h-48 w-auto rounded-md border object-contain"
                  />
                ) : (
                  <div className="flex h-40 items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-5 w-5" /> Using bundled default (/cultural/bharat-mata.jpg)
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="leftImage">Upload new image</Label>
                <Input id="leftImage" type="file" accept="image/*" ref={leftFileRef} />
                <p className="text-xs text-muted-foreground">JPG / PNG / WebP / SVG. Recommended 800×1000 or larger.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="leftTitle">Title (Sanskrit / Devanagari heading)</Label>
                <Input
                  id="leftTitle"
                  value={leftTitle}
                  onChange={(e) => setLeftTitle(e.target.value)}
                  placeholder="वन्दे मातरम्"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="leftCaption">Caption</Label>
                <Input
                  id="leftCaption"
                  value={leftCaption}
                  onChange={(e) => setLeftCaption(e.target.value)}
                  placeholder="Vande Mataram — in devotion to the Motherland"
                />
              </div>

              {data?.devotionPanel.left.image ? (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-red-600">
                  <input
                    type="checkbox"
                    checked={clearLeft}
                    onChange={(e) => setClearLeft(e.target.checked)}
                    className="h-4 w-4 accent-red-600"
                  />
                  <Trash2 className="h-4 w-4" /> Remove uploaded image (revert to bundled default)
                </label>
              ) : null}
            </CardContent>
          </Card>

          {/* RIGHT — Veena */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="font-serif text-xl font-semibold">Right image (Saraswati Veena)</h2>

              <div className="flex items-center justify-center rounded-lg border bg-muted/30 p-3">
                {rightUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rightUrl}
                    alt="Right"
                    className="max-h-48 w-auto rounded-md border object-contain"
                  />
                ) : (
                  <div className="flex h-40 items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-5 w-5" /> Using bundled default (/cultural/veena.png)
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rightImage">Upload new image</Label>
                <Input id="rightImage" type="file" accept="image/*" ref={rightFileRef} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rightTitle">Title (Sanskrit / Devanagari heading)</Label>
                <Input
                  id="rightTitle"
                  value={rightTitle}
                  onChange={(e) => setRightTitle(e.target.value)}
                  placeholder="सरस्वती वीणा"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rightCaption">Caption</Label>
                <Input
                  id="rightCaption"
                  value={rightCaption}
                  onChange={(e) => setRightCaption(e.target.value)}
                  placeholder="The veena — the instrument of Goddess Saraswati"
                />
              </div>

              {data?.devotionPanel.right.image ? (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-red-600">
                  <input
                    type="checkbox"
                    checked={clearRight}
                    onChange={(e) => setClearRight(e.target.checked)}
                    className="h-4 w-4 accent-red-600"
                  />
                  <Trash2 className="h-4 w-4" /> Remove uploaded image (revert to bundled default)
                </label>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner className="h-4 w-4 text-current" /> : <Save className="h-4 w-4" />}
            Save changes
          </Button>
          <a href="/" target="_blank" rel="noreferrer" className="ml-auto">
            <Button type="button" variant="ghost">
              View homepage →
            </Button>
          </a>
        </div>
      </form>
    </div>
  );
}
