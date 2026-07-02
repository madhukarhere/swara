'use client';

import { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { ArrowLeft, Save, RotateCcw, Eye } from 'lucide-react';
import { apiJson } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface PageData {
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

// Same allowlist as the public renderer + backend cleanRich().
const PURIFY_OPTS = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'hr'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):/i,
};

export default function AdminEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<PageData | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Sanitize on-the-fly for the WYSIWYG preview so admin can't XSS themselves.
  const safePreview = useMemo(() => DOMPurify.sanitize(body, PURIFY_OPTS), [body]);

  const load = () => {
    setLoading(true);
    apiJson<{ data: PageData }>(`/api/admin/pages/${slug}`).then((r) => {
      if (r.ok) {
        setData(r.body.data);
        setTitle(r.body.data.title);
        setSubtitle(r.body.data.subtitle ?? '');
        setBody(r.body.data.body);
      } else {
        setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not load page.' });
      }
      setLoading(false);
    });
  };

  useEffect(load, [slug]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const r = await apiJson(`/api/admin/pages/${slug}`, 'PUT', { title, subtitle, body });
    setSaving(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: 'Saved.' });
      const d = (r.body as { data: PageData }).data;
      setData(d);
      setTitle(d.title);
      setSubtitle(d.subtitle ?? '');
      setBody(d.body);
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not save.' });
    }
  };

  const reset = async () => {
    if (!confirm(`Reset “${slug}” to the built-in default? Your current edits will be lost.`)) return;
    const r = await apiJson(`/api/admin/pages/${slug}/reset`, 'POST');
    if (r.ok) {
      const d = (r.body as { data: PageData }).data;
      setData(d);
      setTitle(d.title);
      setSubtitle(d.subtitle ?? '');
      setBody(d.body);
      setMsg({ type: 'ok', text: 'Reset to default.' });
    } else {
      setMsg({ type: 'err', text: (r.body as { error?: string }).error || 'Could not reset.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }
  if (!data) {
    return <p className="text-sm text-red-600">{msg?.text ?? 'Page not found.'}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/pages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> All pages
          </Button>
        </Link>
        <h1 className="font-serif text-2xl font-bold">Edit /{data.slug}</h1>
      </div>

      {msg ? (
        <p className={msg.type === 'ok' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>
          {msg.text}
        </p>
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-5">
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={500}
                placeholder="Short line shown under the title (optional)"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="body">
                  Body HTML — allowed:{' '}
                  <code className="text-xs">&lt;h2&gt; &lt;h3&gt; &lt;p&gt; &lt;ul&gt; &lt;ol&gt; &lt;li&gt; &lt;strong&gt; &lt;em&gt; &lt;a&gt; &lt;blockquote&gt; &lt;br&gt; &lt;hr&gt;</code>
                </Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setPreview((p) => !p)}>
                  <Eye className="h-4 w-4" /> {preview ? 'Edit' : 'Preview'}
                </Button>
              </div>
              {preview ? (
                // DOMPurify-sanitized above via safePreview.
                <div
                  className="article-body min-h-[400px] rounded-md border bg-card p-4"
                  dangerouslySetInnerHTML={{ __html: safePreview }}
                />
              ) : (
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  className="min-h-[500px] font-mono text-sm"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Links, scripts and unknown tags are stripped on save. Only <code>http</code>, <code>https</code>,{' '}
                <code>mailto</code> and <code>tel</code> URLs are kept.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner className="h-4 w-4 text-current" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
              <Button type="button" variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" /> Reset to default
              </Button>
              <a href={`/${data.slug}`} target="_blank" rel="noreferrer" className="ml-auto">
                <Button type="button" variant="ghost">
                  View live →
                </Button>
              </a>
            </div>
            {data.updatedAt ? (
              <p className="text-xs text-muted-foreground">
                Last saved {new Date(data.updatedAt).toLocaleString('en-GB')}
                {data.updatedBy ? ` by ${data.updatedBy}` : ''}.
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
